import { Suspense } from 'react';
import { OrderTrackPage } from '@/components/order/OrderTrackPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order — PandaBDMart',
    description: 'Track your order status in real-time',
};

export default function TrackOrderPage() {
    return (
        <main className="min-h-screen bg-background">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="w-6 h-6 border-2 border-border border-t-text-primary rounded-full animate-spin" />
                    </div>
                }
            >
                <OrderTrackPage />
            </Suspense>
        </main>
    );
}
