const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gufkxeuuzkyaqtavrcpr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zmt4ZXV1emt5YXF0YXZyY3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM0NzM5NiwiZXhwIjoyMDk2OTIzMzk2fQ.0KEQ8hNkGB1Ws28-93xmQ42MoY_fTAD7wT0IAfdVATw';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

const ADMIN_EMAIL = 'bayazidhasabd1971@gmail.com';
const ADMIN_PASSWORD = 'bayazidhasabd1971@gmail.com';

async function seedAdmin() {
    try {
        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL);

        if (existing) {
            console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
            // Ensure role is admin
            const { error: roleErr } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', existing.id);
            if (roleErr) {
                console.error('Failed to update role:', roleErr.message);
                process.exit(1);
            }
            console.log('Role updated to admin.');
            return;
        }

        // Create user
        const { data, error } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            email_confirm: true,
        });

        if (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }

        console.log(`Created user: ${data.user.email} (${data.user.id})`);

        // Update role to admin (the trigger auto-creates users row with role='customer')
        const { error: roleErr } = await supabase
            .from('users')
            .update({ role: 'admin', full_name: 'Admin' })
            .eq('id', data.user.id);

        if (roleErr) {
            throw new Error(`Failed to set admin role: ${roleErr.message}`);
        }

        console.log('Role set to admin.');
        console.log('Admin seed complete!');
    } catch (e) {
        console.error('SEED ADMIN FAILED:', e.message);
        process.exit(1);
    }
}

seedAdmin();
