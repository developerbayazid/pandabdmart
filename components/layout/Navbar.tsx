import Image from 'next/image';
import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';

const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'SHOP', href: '/shop' },
    { label: 'BLOG', href: '/blog' },
    { label: 'CONTACT', href: '/contact' },
];

export function Navbar() {
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
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors tracking-wide"
                            >
                                {link.label}
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
                        <Link
                            href="/cart"
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors relative"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 bg-text-primary text-white text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                                0
                            </span>
                        </Link>
                        <Link
                            href="/signin"
                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                            aria-label="Account"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
