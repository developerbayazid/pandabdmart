const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
});

const projectRef = 'gufkxeuuzkyaqtavrcpr';
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260615200000_create_order_sslcommerz.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function deploy() {
    const trimmed = sql.trim();
    if (!trimmed) {
        console.error('Migration SQL is empty');
        process.exit(1);
    }

    const response = await fetch(
        `https://${projectRef}.supabase.co/rest/v1/rpc/check_sql_deploy`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
                apikey: serviceRoleKey,
                Prefer: 'tx=commit',
            },
            body: JSON.stringify({}),
        },
    );

    if (!response.ok) {
        console.log('SQL execution via REST API requires the Supabase SQL endpoint.');
        console.log('');
        console.log('Please deploy the migration manually:');
        console.log(`  Migration file: supabase/migrations/20260615200000_create_order_sslcommerz.sql`);
        console.log('');
        console.log('Option 1 — Dashboard:');
        console.log(`  Open https://supabase.com/dashboard/project/${projectRef}/sql`);
        console.log('  Paste the contents of the migration file and click Run.');
        console.log('');
        console.log('Option 2 — CLI (after login):');
        console.log('  npx supabase login');
        console.log('  npx supabase link --project-ref ' + projectRef);
        console.log('  npx supabase db push');
        console.log('');
        console.log('Option 3 — Reset DB password and use direct connection:');
        console.log(`  DB: db.${projectRef}.supabase.co:5432`);
        console.log(`  User: postgres`);
    }
}

deploy();
