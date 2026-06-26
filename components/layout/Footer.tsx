import Image from 'next/image';
import Link from 'next/link';
import { getPublicSettings } from '@/repositories/settings.repository';

const footerPagesLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];

const footerServicesLinks = [
    { label: 'Panjabi', href: '/shop' },
    { label: 'Trouser', href: '/shop' },
    { label: 'Perfume', href: '/shop' },
    { label: 'Footwear', href: '/shop' },
];

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

function YoutubeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.53c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
    );
}

function LinkedinIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

export async function Footer() {
    const settings = await getPublicSettings();

    const socialLinks: { href: string; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [];
    if (settings?.facebookUrl) socialLinks.push({ href: settings.facebookUrl, Icon: FacebookIcon, label: 'Facebook' });
    if (settings?.footerTwitterUrl) socialLinks.push({ href: settings.footerTwitterUrl, Icon: TwitterIcon, label: 'Twitter' });
    if (settings?.instagramUrl) socialLinks.push({ href: settings.instagramUrl, Icon: InstagramIcon, label: 'Instagram' });
    if (settings?.youtubeUrl) socialLinks.push({ href: settings.youtubeUrl, Icon: YoutubeIcon, label: 'YouTube' });
    if (settings?.footerLinkedinUrl) socialLinks.push({ href: settings.footerLinkedinUrl, Icon: LinkedinIcon, label: 'LinkedIn' });

    return (
        <footer className="bg-text-primary text-white">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    <div className="sm:col-span-2 lg:col-span-1">
                        {settings?.logoUrl ? (
                            <Image
                                src={settings.logoUrl}
                                alt={settings.storeName ?? 'Store'}
                                width={100}
                                height={28}
                                className="h-7 w-auto mb-4 invert"
                            />
                        ) : (
                            <p className="text-[16px] font-semibold text-white mb-4">
                                {settings?.storeName ?? 'Store'}
                            </p>
                        )}
                        {settings?.footerTagline && (
                            <p className="text-[13px] text-white/70 leading-relaxed mb-6 max-w-xs">
                                {settings.footerTagline}
                            </p>
                        )}
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-3">
                                {socialLinks.map((link) => (
                                    <Link key={link.label} href={link.href} className="text-white/70 hover:text-white transition-colors" aria-label={link.label}>
                                        <link.Icon className="w-4 h-4" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-[14px] font-semibold text-white mb-4">Pages</h4>
                        <ul className="space-y-2.5">
                            {footerPagesLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-[13px] text-white/70 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[14px] font-semibold text-white mb-4">Services</h4>
                        <ul className="space-y-2.5">
                            {footerServicesLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-[13px] text-white/70 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[14px] font-semibold text-white mb-4">Contacts</h4>
                        <ul className="space-y-2.5">
                            {settings?.storeAddress && (
                                <li className="text-[13px] text-white/70 leading-relaxed">
                                    {settings.storeAddress}
                                </li>
                            )}
                            {settings?.storeEmail && (
                                <li className="text-[13px] text-white/70">
                                    {settings.storeEmail}
                                </li>
                            )}
                            {settings?.storePhone && (
                                <li className="text-[13px] text-white/70">
                                    {settings.storePhone}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-4">
                    <p className="text-[11px] text-white/50 text-center">
                        {settings?.footerCopyright ? `${settings.footerCopyright} ${settings.storeName ?? ''}` : 'Copyright © 2025. All Rights Reserved'}
                    </p>
                </div>
            </div>
        </footer>
    );
}
