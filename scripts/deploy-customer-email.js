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
const accessToken = envVars.SUPABASE_ACCESS_TOKEN;

if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260615230000_add_customer_email.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function deploy() {
    if (accessToken) {
        const response = await fetch(
            `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sql }),
            },
        );

        if (response.ok) {
            console.log('Migration deployed successfully via Management API!');
            return;
        }
        const err = await response.text();
        console.log('Management API failed:', err.substring(0, 200));
    }

    console.log('');
    console.log('Please deploy manually:');
    console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql`);
    console.log('  Copy the contents of: supabase/migrations/20260615230000_add_customer_email.sql');
}

deploy();
