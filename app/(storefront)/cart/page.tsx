import { Suspense } from 'react';
import { getUser } from '@/lib/auth/get-user';
import { getCartItems } from '@/repositories/cart.repository';
import { CartItem } from '@/types/cart';
import { CartPageClient } from '@/components/cart/CartPage';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function CartPageRoute() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CartContent />
        </Suspense>
    );
}

async function CartContent() {
    const user = await getUser();
    let initialItems: CartItem[] | null = null;

    if (user) {
        try {
            initialItems = await getCartItems(user.id);
        } catch {
            initialItems = [];
        }
    }

    return <CartPageClient initialItems={initialItems} />;
}
