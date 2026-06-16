import { Suspense } from 'react';
import { OrderTrackServer } from '@/components/order/OrderTrackServer';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order — PandaBDMart',
    description: 'Track your order status in real-time',
};

type PageProps = {
    params: Promise<{ orderId: string }>;
};

export default function TrackOrderPage({ params }: PageProps) {
    return (
        <main className="min-h-screen bg-background">
            <Suspense fallback={<PageSpinner />}>
                <OrderTrackServer params={params} />
            </Suspense>
        </main>
    );
}
