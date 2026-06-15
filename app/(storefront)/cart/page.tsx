import { getUser } from '@/lib/auth/get-user';
import { getCartItems } from '@/repositories/cart.repository';
import { CartItem } from '@/types/cart';
import { CartPageClient } from '@/components/cart/CartPage';

export default async function CartPageRoute() {
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
