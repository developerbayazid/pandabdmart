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
    console.error('SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
}

const files = [
    '20260615230000_add_customer_email.sql',
    '20260615235000_cancel_order_rpc.sql',
];

async function deployOne(name) {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', name), 'utf8');

    if (!accessToken) return false;

    const res = await fetch(
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
    return res.ok;
}

async function main() {
    let ok = true;
    for (const f of files) {
        const success = await deployOne(f);
        if (success) {
            console.log(`OK  ${f}`);
        } else {
            console.log(`FAIL ${f}`);
            ok = false;
        }
    }

    if (ok) {
        console.log('\nAll migrations deployed.');
    } else {
        console.log('\nManual deploy needed:');
        console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql`);
        files.forEach(f => console.log(`  supabase/migrations/${f}`));
    }
}

main();
