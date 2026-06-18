import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/require-role';
import { getAdminOrderDetail } from '@/services/order.service';
import { OrderDetailView } from '@/components/admin/OrderDetailView';
import { PageSpinner } from '@/components/ui/PageSpinner';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default function AdminOrderDetailPage(props: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <OrderDetailContent params={props.params} />
        </Suspense>
    );
}

async function OrderDetailContent({ params }: { params: PageProps['params'] }) {
    await requireRole('admin', 'shop_manager');

    const { id } = await params;
    const result = await getAdminOrderDetail(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <OrderDetailView order={result.data} />;
}
