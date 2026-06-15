import { requireAuth } from '@/lib/auth/require-auth';
import { getCartItems } from '@/repositories/cart.repository';
import { getShippingZones } from '@/repositories/shipping.repository';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';

export default async function CheckoutPageRoute() {
    const user = await requireAuth();

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
