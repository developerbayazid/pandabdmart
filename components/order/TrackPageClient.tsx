'use client';

import { useRouter } from 'next/navigation';
import { GuestOrderLookup } from '@/components/order/GuestOrderLookup';
import type { Order } from '@/types/order';

export function TrackPageClient() {
    const router = useRouter();

    const handleOrderFound = (order: Order) => {
        router.push(`/track/${order.id}`);
    };

    return (
        <div className="max-w-[800px] mx-auto px-4 py-12">
            <GuestOrderLookup onOrderFound={handleOrderFound} />
        </div>
    );
}
