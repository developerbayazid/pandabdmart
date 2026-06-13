import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();

    if (!user) {
        redirect('/signin');
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6">
                <Link href="/" className="text-[15px] font-semibold text-text-primary">
                    PandaBD Mart
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary">
                        {user.fullName || user.email}
                    </span>
                    <Link
                        href="/account"
                        className="text-sm text-text-secondary hover:text-text-primary"
                    >
                        Account
                    </Link>
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
                        <SidebarLink href="/account">Account</SidebarLink>
                        <SidebarLink href="/account/orders">Orders</SidebarLink>
                        <SidebarLink href="/account/wishlist">Wishlist</SidebarLink>
                        <SidebarLink href="/account/reviews">Reviews</SidebarLink>
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

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors"
        >
            {children}
        </Link>
    );
}
