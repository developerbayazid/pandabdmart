import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { getAdminCustomerDetail, getAdminCustomerOrders } from '@/services/customer.service';
import { CustomerDetailView } from '@/components/admin/CustomerDetailView';
import { PageSpinner } from '@/components/ui/PageSpinner';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default function AdminCustomerDetailPage(props: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CustomerDetailContent params={props.params} />
        </Suspense>
    );
}

async function CustomerDetailContent({ params }: { params: PageProps['params'] }) {
    await requireRole('admin');

    const { id } = await params;

    const [customerResult, ordersResult] = await Promise.all([
        getAdminCustomerDetail(id),
        getAdminCustomerOrders(id, 1),
    ]);

    if (!customerResult.success || !customerResult.data) {
        notFound();
    }

    return (
        <CustomerDetailView
            customer={customerResult.data}
            initialOrders={ordersResult.success && ordersResult.data ? ordersResult.data : null}
        />
    );
}
