import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';

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
            <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6">
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
            <div className="flex">
                <aside className="w-60 min-h-[calc(100vh-64px)] bg-surface border-r border-border p-6">
                    <nav className="space-y-1">
                        <AdminSidebarLink href="/admin/dashboard">Dashboard</AdminSidebarLink>
                        <AdminSidebarLink href="/admin/products">Products</AdminSidebarLink>
                        <AdminSidebarLink href="/admin/categories">Categories</AdminSidebarLink>
                        <AdminSidebarLink href="/admin/brands">Brands</AdminSidebarLink>
                        <AdminSidebarLink href="/admin/orders">Orders</AdminSidebarLink>
                        <AdminSidebarLink href="/admin/payments">Payments</AdminSidebarLink>
                        {isAdmin && (
                            <>
                                <AdminSidebarLink href="/admin/customers">Customers</AdminSidebarLink>
                                <AdminSidebarLink href="/admin/coupons">Coupons</AdminSidebarLink>
                                <AdminSidebarLink href="/admin/shipping">Shipping</AdminSidebarLink>
                                <AdminSidebarLink href="/admin/settings">Settings</AdminSidebarLink>
                                <AdminSidebarLink href="/admin/audit-logs">Audit Logs</AdminSidebarLink>
                            </>
                        )}
                    </nav>
                </aside>
                <main className="flex-1 p-8">{children}</main>
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

function AdminSidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors"
        >
            {children}
        </Link>
    );
}
