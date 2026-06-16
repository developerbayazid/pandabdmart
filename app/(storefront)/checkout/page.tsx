import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/require-auth';
import { getCartItems } from '@/repositories/cart.repository';
import { getShippingZones } from '@/repositories/shipping.repository';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default async function CheckoutPageRoute() {
    const user = await requireAuth();

    return (
        <Suspense fallback={<PageSpinner />}>
            <CheckoutContent user={user} />
        </Suspense>
    );
}

async function CheckoutContent({ user }: { user: { id: string; email?: string | null } }) {
    const [items, zones] = await Promise.all([
        getCartItems(user.id).catch(() => []),
        getShippingZones(),
    ]);

    return (
        <CheckoutPage
            initialItems={items}
            zones={zones}
            userEmail={user.email ?? undefined}
        />
    );
}
