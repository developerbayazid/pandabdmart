const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
});

const supabaseUrl = 'https://gufkxeuuzkyaqtavrcpr.supabase.co';
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
    // Check if data already exists
    const { data: existing } = await supabase
        .from('shipping_zones')
        .select('id')
        .limit(1);

    if (existing && existing.length > 0) {
        console.log('Shipping zones already exist. Updating...');
        // Delete and re-insert
        await supabase.from('shipping_zones').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const zones = [
        { name: 'Standard Shipping', cost: 5.0 },
        { name: 'Express Shipping', cost: 9.0 },
    ];

    // First try with description column (migration applied)
    const zonesWithDesc = zones.map((z) => ({
        ...z,
        description:
            z.name === 'Standard Shipping'
                ? 'within 3-4 days main city, within 4-7 days outside main city'
                : 'within 24-48 hours',
    }));

    let { error } = await supabase.from('shipping_zones').insert(zonesWithDesc).select();

    // If description column doesn't exist, fall back to insert without it
    if (error && error.message.includes('description')) {
        console.log('description column not found, inserting without descriptions...');
        const { error: fallbackError } = await supabase.from('shipping_zones').insert(zones).select();
        if (fallbackError) {
            console.error('Failed:', fallbackError.message);
            process.exit(1);
        }
    } else if (error) {
        console.error('Failed:', error.message);
        process.exit(1);
    }

    console.log('Shipping methods seeded successfully');
}

seed();
