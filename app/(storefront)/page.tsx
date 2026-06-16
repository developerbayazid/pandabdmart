import { Suspense } from 'react';
import { getHomepageProducts, getShopFilterOptions } from '@/repositories/product.repository';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProduct } from '@/components/home/FeaturedProduct';
import { ProductCards } from '@/components/home/ProductCards';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionGrid } from '@/components/home/CollectionGrid';
import { FestiveBanner } from '@/components/home/FestiveBanner';
import { RecentProducts } from '@/components/home/RecentProducts';
import { LatestNews } from '@/components/home/LatestNews';
import { PageSpinner } from '@/components/ui/PageSpinner';

export const revalidate = 60;

export default function Home() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <HomeContent />
        </Suspense>
    );
}

async function HomeContent() {
    const [products, filterOptions] = await Promise.all([
        getHomepageProducts(),
        getShopFilterOptions(),
    ]);

    const featuredProduct = products[0] ?? null;
    const cardProducts = products.slice(1, 4);

    return (
        <>
            <HeroSection />
            {featuredProduct && <FeaturedProduct product={featuredProduct} />}
            {cardProducts.length > 0 && <ProductCards products={cardProducts} />}
            <TrendingProducts products={products} categories={filterOptions.categories} />
            <CollectionGrid />
            <FestiveBanner />
            <RecentProducts products={products} />
            <LatestNews />
        </>
    );
}
