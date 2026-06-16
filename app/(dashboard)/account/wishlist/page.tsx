import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { WishlistContent } from '@/components/dashboard/WishlistContent';
import type { WishlistItem } from '@/repositories/wishlist.repository';

export default function WishlistPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <WishlistContentAsync />
        </Suspense>
    );
}

async function WishlistContentAsync() {
    const user = await getUser();
    if (!user) redirect('/signin');

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('wishlists')
        .select(`
            id,
            variant_id,
            created_at,
            variant:product_variants!inner(
                id,
                sku,
                price,
                compare_price,
                stock,
                reserved_stock,
                product_id,
                product:products!inner(
                    id,
                    name,
                    slug
                ),
                variant_images(url, is_primary),
                variant_attribute_values(
                    value:attribute_values(
                        value,
                        attribute:attributes(name)
                    )
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div>
                <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                    My Wishlist
                </h2>
                <div className="bg-error-light text-error-foreground text-sm p-4 rounded-md">
                    Failed to load wishlist: {error.message}
                </div>
            </div>
        );
    }

    const items: WishlistItem[] = (data ?? []).map((item) => {
        const variant = item.variant as unknown as {
            id: string;
            sku: string;
            price: number;
            compare_price: number | null;
            stock: number;
            reserved_stock: number;
            product_id: string;
            product: { id: string; name: string; slug: string };
            variant_images: { url: string; is_primary: boolean }[];
            variant_attribute_values: {
                value: { value: string; attribute: { name: string } };
            }[];
        };

        const primaryImage = variant.variant_images?.find((img) => img.is_primary);
        const attributeNames = variant.variant_attribute_values
            ?.map((vav) => vav.value.value)
            .join(', ') ?? '';

        return {
            id: item.id,
            variantId: variant.id,
            productId: variant.product.id,
            productName: variant.product.name,
            productSlug: variant.product.slug,
            variantSku: variant.sku,
            price: Number(variant.price),
            comparePrice: variant.compare_price ? Number(variant.compare_price) : null,
            stock: variant.stock - (variant.reserved_stock ?? 0),
            image: primaryImage?.url ?? null,
            attributeNames,
            addedAt: item.created_at,
        };
    });

    return <WishlistContent items={items} />;
}
