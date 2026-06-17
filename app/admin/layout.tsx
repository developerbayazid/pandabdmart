import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        redirect('/');
    }

    const isAdmin = user.role === 'admin';

    return (
        <div className="min-h-screen bg-background">
            {/* Top header */}
            <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-50">
                <Link href="/" className="text-[15px] font-semibold text-text-primary">
                    PandaBD Mart
                </Link>
                <div className="flex items-center gap-3">
                    <span className="bg-surface-secondary text-text-secondary text-xs font-medium px-2 py-1 rounded-full capitalize">
                        {user.role.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-text-secondary">
                        {user.fullName || user.email}
                    </span>
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="text-sm text-text-secondary hover:text-text-primary"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </header>

            <div className="flex pt-16">
                <AdminSidebar isAdmin={isAdmin} />
                <main className="flex-1 ml-[280px] p-8">{children}</main>
            </div>
        </div>
    );
}

async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/signin');
}
