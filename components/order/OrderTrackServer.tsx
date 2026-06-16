import { getOrderAction } from '@/actions/order.actions';
import { OrderTrackPage } from '@/components/order/OrderTrackPage';

export async function OrderTrackServer({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    const result = await getOrderAction(orderId);

    if (!result.success || !result.order) {
        return (
            <OrderTrackPage
                initialOrder={null}
                initialError={result.error ?? 'Order not found'}
                orderIdOverride={orderId}
            />
        );
    }

    return (
        <OrderTrackPage
            initialOrder={result.order}
            initialError={null}
            orderIdOverride={orderId}
        />
    );
}
