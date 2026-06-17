'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CreditCard,
    Users,
    Tag,
    Truck,
    Settings,
    FileText,
    ChevronDown,
} from 'lucide-react';

type AdminSidebarProps = {
    isAdmin: boolean;
};

export function AdminSidebar({ isAdmin }: AdminSidebarProps) {
    const pathname = usePathname();
    const [catalogOpen, setCatalogOpen] = useState(
        pathname.startsWith('/admin/products') ||
            pathname.startsWith('/admin/categories') ||
            pathname.startsWith('/admin/brands'),
    );

    return (
        <aside className="w-[280px] min-h-[calc(100vh-64px)] bg-surface border-r border-border fixed left-0 top-16 bottom-0 overflow-y-auto flex flex-col z-40">
            {/* Brand */}
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-6 pt-6 pb-2">
                <div className="w-9 h-9 rounded-[10px] bg-surface-inverse flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-text-inverse" />
                </div>
                <span className="text-[19px] font-bold text-text-primary leading-7">
                    PandaBD
                </span>
            </Link>

            <nav className="flex-1 px-4 py-4">
                <NavSection label="Menu">
                    <NavItem
                        href="/admin/dashboard"
                        icon={LayoutDashboard}
                        active={pathname === '/admin/dashboard' || pathname === '/admin'}
                    >
                        Dashboard
                    </NavItem>

                    <div>
                        <button
                            onClick={() => setCatalogOpen(!catalogOpen)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors cursor-pointer"
                        >
                            <Package className="w-5 h-5 shrink-0" />
                            <span className="flex-1 text-left">Catalog</span>
                            <ChevronDown
                                className={`w-4 h-4 shrink-0 text-text-muted transition-transform ${
                                    catalogOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        {catalogOpen && (
                            <div className="pl-[35px] pr-2 pb-1 space-y-0.5 pt-0.5">
                                <NavSubItem
                                    href="/admin/products"
                                    active={pathname.startsWith('/admin/products')}
                                >
                                    Products
                                </NavSubItem>
                                <NavSubItem
                                    href="/admin/categories"
                                    active={pathname.startsWith('/admin/categories')}
                                >
                                    Categories
                                </NavSubItem>
                                <NavSubItem
                                    href="/admin/brands"
                                    active={pathname.startsWith('/admin/brands')}
                                >
                                    Brands
                                </NavSubItem>
                            </div>
                        )}
                    </div>

                    <NavItem
                        href="/admin/orders"
                        icon={ShoppingCart}
                        active={pathname.startsWith('/admin/orders')}
                    >
                        Orders
                    </NavItem>
                    <NavItem
                        href="/admin/payments"
                        icon={CreditCard}
                        active={pathname.startsWith('/admin/payments')}
                    >
                        Payments
                    </NavItem>
                </NavSection>

                {isAdmin && (
                    <NavSection label="Management">
                        <NavItem
                            href="/admin/customers"
                            icon={Users}
                            active={pathname.startsWith('/admin/customers')}
                        >
                            Customers
                        </NavItem>
                        <NavItem
                            href="/admin/coupons"
                            icon={Tag}
                            active={pathname.startsWith('/admin/coupons')}
                        >
                            Coupons
                            <NewBadge />
                        </NavItem>
                        <NavItem
                            href="/admin/shipping"
                            icon={Truck}
                            active={pathname.startsWith('/admin/shipping')}
                        >
                            Shipping
                        </NavItem>
                        <NavItem
                            href="/admin/settings"
                            icon={Settings}
                            active={pathname.startsWith('/admin/settings')}
                        >
                            Settings
                        </NavItem>
                        <NavItem
                            href="/admin/audit-logs"
                            icon={FileText}
                            active={pathname.startsWith('/admin/audit-logs')}
                        >
                            Audit Logs
                        </NavItem>
                    </NavSection>
                )}
            </nav>

            <div className="px-6 py-4 border-t border-border">
                <div className="text-[13px] font-semibold text-text-primary">
                    PandaBD Mart
                </div>
                <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                    E-commerce Admin Panel
                </div>
            </div>
        </aside>
    );
}

function NavSection({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="mb-6">
            <div className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {label}
            </div>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function NavItem({
    href,
    icon: Icon,
    active,
    children,
}: {
    href: string;
    icon: React.ElementType;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                active
                    ? 'bg-surface-secondary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{children}</span>
        </Link>
    );
}

function NavSubItem({
    href,
    active,
    children,
}: {
    href: string;
    active: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-md transition-colors ${
                active
                    ? 'bg-surface-secondary text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    active ? 'bg-text-primary' : 'bg-text-muted'
                }`}
            />
            {children}
        </Link>
    );
}

function NewBadge() {
    return (
        <span className="text-[10px] font-medium bg-success-light text-success-foreground px-1.5 py-0.5 rounded-sm">
            NEW
        </span>
    );
}
