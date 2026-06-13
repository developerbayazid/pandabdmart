const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) { console.error('SUPABASE_DB_PASSWORD required'); process.exit(1); }

const cs = `postgresql://postgres.gufkxeuuzkyaqtavrcpr:${encodeURIComponent(password)}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`;

const migration = process.argv[2];
if (!migration) { console.error('Usage: node apply-migration.js <migration-file>'); process.exit(1); }

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', migration), 'utf-8');

async function main() {
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log(`Running ${migration}...`);
        await client.query(sql);
        console.log('Applied successfully.');
        await client.end();
    } catch (e) {
        console.error('FAILED:', e.message);
        try { await client.end(); } catch {}
        process.exit(1);
    }
}

main();
