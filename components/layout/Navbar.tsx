import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { AuthNavActions } from '@/components/auth/AuthNavActions';
import { CartNavLink } from '@/components/cart/CartNavLink';
import { createClient } from '@/lib/supabase/server';
import { getCartCount } from '@/repositories/cart.repository';
import { getPublicSettings } from '@/repositories/settings.repository';

export async function Navbar() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name');

    let cartCount: number | null = null;
    let isAdmin = false;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        try {
            cartCount = await getCartCount(user.id);
        } catch {
            cartCount = 0;
        }
        const { data: userRow } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
        isAdmin = userRow?.role === 'admin' || userRow?.role === 'shop_manager';
    }

    const settings = await getPublicSettings();

    return (
        <header className="w-full">
            {settings?.headerAnnouncementEnabled && settings.headerAnnouncementText && (
                <div className="bg-background border-b border-border">
                    <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between py-2">
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
                            {settings.headerAnnouncementText}
                        </span>
                        {settings.headerAnnouncementCtaText && settings.headerAnnouncementCtaLink && (
                            <Link
                                href={settings.headerAnnouncementCtaLink}
                                className="text-[10px] text-text-secondary uppercase tracking-wider font-medium hover:text-text-primary transition-colors underline underline-offset-2"
                            >
                                {settings.headerAnnouncementCtaText}
                            </Link>
                        )}
                        {settings.headerBusinessHours && (
                            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium hidden sm:block">
                                {settings.headerBusinessHours}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <nav className="bg-surface border-b border-border">
                <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center">
                        {settings?.logoUrl ? (
                            <Image
                                src={settings.logoUrl}
                                alt={settings.storeName ?? 'Store'}
                                width={100}
                                height={28}
                                className="h-7 w-auto"
                            />
                        ) : (
                            <span className="text-[16px] font-semibold text-text-primary">
                                {settings?.storeName ?? 'Store'}
                            </span>
                        )}
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors tracking-wide"
                        >
                            HOME
                        </Link>
                        <Link
                            href="/shop"
                            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors tracking-wide"
                        >
                            SHOP
                        </Link>
                        <Link
                            href="/track"
                            className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors tracking-wide"
                        >
                            TRACK ORDER
                        </Link>
                        {(categories ?? []).map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/categories/${cat.slug}`}
                                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors tracking-wide"
                            >
                                {cat.name.toUpperCase()}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <CartNavLink initialCount={cartCount} />
                        <AuthNavActions isAdmin={isAdmin} />
                    </div>
                </div>
            </nav>
        </header>
    );
}
