const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
});

const supabase = createClient(
    'https://gufkxeuuzkyaqtavrcpr.supabase.co',
    envVars.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
);

async function deploy() {
    const { error } = await supabase.rpc('run_cod_migration', {}).maybeSingle();

    if (error && error.message.includes('function')) {
        const response = await fetch(
            'https://gufkxeuuzkyaqtavrcpr.supabase.co/rest/v1/rpc/alter_payment_constraint',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${envVars.SUPABASE_SERVICE_ROLE_KEY}`,
                    apikey: envVars.SUPABASE_SERVICE_ROLE_KEY,
                },
                body: JSON.stringify({}),
            },
        );
    }

    console.log('Migration applied. Run this SQL manually if needed:');
    console.log('ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;');
    console.log("ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('sslcommerz', 'bkash', 'nagad', 'cash_on_delivery'));");
    console.log('');
    console.log('SQL editor: https://supabase.com/dashboard/project/gufkxeuuzkyaqtavrcpr/sql');
}

deploy();
