import { Suspense } from 'react';
import { TrackPageClient } from '@/components/order/TrackPageClient';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order — PandaBDMart',
    description: 'Track your order status',
};

export default function TrackPage() {
    return (
        <main className="min-h-screen bg-background">
            <Suspense fallback={<PageSpinner />}>
                <TrackPageClient />
            </Suspense>
        </main>
    );
}
