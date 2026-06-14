import { ProductCard } from '@/components/product/ProductCard';
import type { ShopProduct } from '@/types/shop';

type ProductCardsProps = {
    products: ShopProduct[];
};

export function ProductCards({ products }: ProductCardsProps) {
    const displayProducts = products.slice(0, 3);

    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
