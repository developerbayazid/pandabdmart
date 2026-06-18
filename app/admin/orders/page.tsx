import { Suspense } from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getAdminOrders } from '@/services/order.service';
import { OrderList } from '@/components/admin/OrderList';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { AdminOrderFilters } from '@/types/admin-order';
import type { OrderStatus } from '@/lib/constants/order';

type PageProps = {
    searchParams: Promise<{
        search?: string;
        status?: string;
        paymentMethod?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: string;
    }>;
};

export default function AdminOrdersPage(props: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <OrdersContent searchParams={props.searchParams} />
        </Suspense>
    );
}

async function OrdersContent({ searchParams }: { searchParams: PageProps['searchParams'] }) {
    await requireRole('admin', 'shop_manager');

    const params = await searchParams;

    const filters: AdminOrderFilters = {
        search: params.search,
        status: params.status as OrderStatus | undefined,
        paymentMethod: params.paymentMethod,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        page: params.page ? parseInt(params.page, 10) : 1,
    };

    const result = await getAdminOrders(filters);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Orders</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Manage and track customer orders
                </p>
            </div>

            <OrderList
                initialData={result.success && result.data ? result.data : null}
                currentFilters={filters}
            />
        </div>
    );
}
