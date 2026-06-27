import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { getUser } from '@/lib/auth/get-user';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getPublicSettings } from '@/repositories/settings.repository';

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
    let settings: { logoUrl: string | null; storeName: string } | null = null;
    try {
        const data = await getPublicSettings();
        if (data) {
            settings = { logoUrl: data.logoUrl, storeName: data.storeName };
        }
    } catch {
        // settings remain null; sidebar falls back to default icon+name
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Top header */}
            <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    {settings?.logoUrl ? (
                        <Image
                            src={settings.logoUrl}
                            alt={settings.storeName}
                            width={112}
                            height={28}
                            className="h-7 w-auto"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-inverse flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-text-inverse" />
                            </div>
                            <span className="text-[15px] font-semibold text-text-primary">
                                {settings?.storeName ?? 'PandaBD'}
                            </span>
                        </div>
                    )}
                </div>
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

            {/* Body: sidebar + main */}
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar isAdmin={isAdmin} />
                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
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
