'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    FolderTree,
    Building2,
    ShoppingCart,
    CreditCard,
    Users,
    Tag,
    Truck,
    Settings,
    FileText,
} from 'lucide-react';

type AdminSidebarProps = {
    isAdmin: boolean;
};

export function AdminSidebar({ isAdmin }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-[280px] bg-surface border-r border-border shrink-0 flex flex-col">
            <div className="pt-5 pb-2" />

            <nav className="flex-1 px-4 py-3">
                <NavSection label="Menu">
                    <NavItem
                        href="/admin/dashboard"
                        icon={LayoutDashboard}
                        active={pathname === '/admin/dashboard' || pathname === '/admin'}
                    >
                        Dashboard
                    </NavItem>
                    <NavItem
                        href="/admin/products"
                        icon={Package}
                        active={pathname.startsWith('/admin/products')}
                    >
                        Products
                    </NavItem>
                    <NavItem
                        href="/admin/inventory"
                        icon={Warehouse}
                        active={pathname.startsWith('/admin/inventory')}
                    >
                        Inventory
                    </NavItem>
                    <NavItem
                        href="/admin/categories"
                        icon={FolderTree}
                        active={pathname.startsWith('/admin/categories')}
                    >
                        Categories
                    </NavItem>
                    <NavItem
                        href="/admin/brands"
                        icon={Building2}
                        active={pathname.startsWith('/admin/brands')}
                    >
                        Brands
                    </NavItem>
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
        <div className="mb-5">
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
            className={`flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-lg transition-colors ${
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
