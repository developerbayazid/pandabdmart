import Image from 'next/image';
import type { ShopProduct } from '@/types/shop';

type FeaturedProductProps = {
    product: ShopProduct;
};

export function FeaturedProduct({ product }: FeaturedProductProps) {
    const formattedPrice = new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
    }).format(product.price);

    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    <div className="flex-1 relative w-full max-w-[480px] h-[480px] lg:h-[560px]">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                                No Image
                            </div>
                        )}
                    </div>

                    <div className="flex-1 max-w-md">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-text-secondary text-sm font-medium">
                                {product.categoryName}
                            </span>
                            <span className="w-8 h-px bg-text-secondary" />
                        </div>
                        <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary mb-4">
                            {product.name}
                        </h2>
                        <p className="text-[24px] font-semibold text-text-primary mb-3">
                            {formattedPrice}
                        </p>
                        {product.description && (
                            <p className="text-text-secondary text-sm leading-relaxed mb-6">
                                {product.description}
                            </p>
                        )}
                        <button className="border border-text-primary text-text-primary px-6 py-2.5 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md">
                            Add To Cart
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
