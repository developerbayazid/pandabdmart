import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { AuthNavActions } from '@/components/auth/AuthNavActions';
import { CartNavLink } from '@/components/cart/CartNavLink';
import { createClient } from '@/lib/supabase/server';
import { getCartCount } from '@/repositories/cart.repository';

export async function Navbar() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name');

    let cartCount: number | null = null;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        try {
            cartCount = await getCartCount(user.id);
        } catch {
            cartCount = 0;
        }
    }

    return (
        <header className="w-full">
            {/* Announcement Bar */}
            <div className="bg-background border-b border-border">
                <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between py-2">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
                        UP TO 40% OFF BEST SELLING PANJABI
                    </span>
                    <Link
                        href="/shop"
                        className="text-[10px] text-text-secondary uppercase tracking-wider font-medium hover:text-text-primary transition-colors underline underline-offset-2"
                    >
                        SHOP NOW
                    </Link>
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium hidden sm:block">
                        OPEN 9AM TO 9PM / (123) 456-7890
                    </span>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="bg-surface border-b border-border">
                <div className="max-w-[1440px] mx-auto px-8 lg:px-16 flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/Ethniq.png"
                            alt="ETHNIQ"
                            width={100}
                            height={28}
                            className="h-7 w-auto"
                        />
                    </Link>

                    {/* Nav Links */}
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

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <CartNavLink initialCount={cartCount} />
                        <AuthNavActions />
                    </div>
                </div>
            </nav>
        </header>
    );
}
