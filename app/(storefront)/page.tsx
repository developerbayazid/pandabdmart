import { Suspense } from 'react';
import { getHomepageProducts, getShopFilterOptions } from '@/repositories/product.repository';
import { getProductsByIds } from '@/repositories/product.repository';
import { getPublicSettings } from '@/repositories/settings.repository';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProduct } from '@/components/home/FeaturedProduct';
import { ProductCards } from '@/components/home/ProductCards';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionGrid } from '@/components/home/CollectionGrid';
import { FestiveBanner } from '@/components/home/FestiveBanner';
import { RecentProducts } from '@/components/home/RecentProducts';
import { LatestNews } from '@/components/home/LatestNews';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { HeroSlide, CollectionGridItem } from '@/types/admin-settings';
import type { ShopProduct } from '@/types/shop';

export const revalidate = 60;

export default function Home() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <HomeContent />
        </Suspense>
    );
}

async function HomeContent() {
    const [allProducts, filterOptions, settings] = await Promise.all([
        getHomepageProducts(),
        getShopFilterOptions(),
        getPublicSettings(),
    ]);

    const featuredProductId = settings?.homepageFeaturedProductId;
    const productCardIds = settings?.homepageProductCardIds?.filter(Boolean) ?? [];
    const trendingIds = settings?.homepageTrendingProductIds?.filter(Boolean) ?? [];
    const recentIds = settings?.homepageRecentProductIds?.filter(Boolean) ?? [];

    let featuredProduct: ShopProduct | null = null;
    let cardProducts: ShopProduct[] = [];
    let trendingProducts: ShopProduct[] = allProducts;
    let recentProducts: ShopProduct[] = allProducts;

    if (featuredProductId) {
        const [found] = await getProductsByIds([featuredProductId]);
        featuredProduct = found ?? null;
    }
    if (!featuredProduct) featuredProduct = allProducts[0] ?? null;

    if (productCardIds.length > 0) {
        cardProducts = await getProductsByIds(productCardIds);
    }
    if (cardProducts.length === 0) cardProducts = allProducts.slice(1, 4);

    if (trendingIds.length > 0) {
        trendingProducts = await getProductsByIds(trendingIds);
    }

    if (recentIds.length > 0) {
        recentProducts = await getProductsByIds(recentIds);
    }

    return (
        <>
            <HeroSection
                slides={settings?.heroSlides ?? defaultHeroSlides}
                ctaText={settings?.heroCtaText ?? 'Shop Now'}
                ctaLink={settings?.heroCtaLink ?? '/shop'}
            />
            {featuredProduct && <FeaturedProduct product={featuredProduct} />}
            {cardProducts.length > 0 && <ProductCards products={cardProducts} />}
            <TrendingProducts
                products={trendingProducts}
                categories={filterOptions.categories}
                title={settings?.homepageTrendingTitle ?? 'Trending Products'}
                subtitle={settings?.homepageTrendingSubtitle ?? 'Discover the Most Wanted Styles'}
            />
            <CollectionGrid
                items={settings?.homepageCollectionImages ?? defaultCollectionItems}
            />
            <FestiveBanner
                eyebrow={settings?.homepageFestiveEyebrow ?? 'Festive Special:'}
                title={settings?.homepageFestiveTitle ?? 'Flat 30% Off on All Panjabis'}
                ctaText={settings?.homepageFestiveCtaText ?? 'Shop Now'}
                ctaLink={settings?.homepageFestiveCtaLink ?? '/shop'}
                image={settings?.homepageFestiveImage ?? '/images/Header Product Image.png'}
            />
            <RecentProducts
                products={recentProducts}
                title={settings?.homepageRecentTitle ?? 'Recent Products'}
                subtitle={settings?.homepageRecentSubtitle ?? 'Explore Our Latest Arrivals'}
            />
            <LatestNews
                title={settings?.homepageLatestNewsTitle ?? 'Latest News'}
                subtitle={settings?.homepageLatestNewsSubtitle ?? 'Style Insights: Fashion Tips & Trends'}
            />
        </>
    );
}

const defaultHeroSlides: HeroSlide[] = [
    { title: 'A model wearing your best Panjabi design.', subtitle: 'Elevate Your Style with Our Finest Panjabi Collection.', image: '/images/Hero Product Image.png', price: '$45' },
    { title: 'Traditional elegance meets modern style.', subtitle: 'Discover our premium collection of handcrafted panjabis.', image: '/images/Hero Product Image (1).png', price: '$52' },
    { title: 'Crafted with precision and passion.', subtitle: 'Experience the finest fabrics and intricate designs.', image: '/images/Hero Product Image (2).png', price: '$48' },
];

const defaultCollectionItems: CollectionGridItem[] = [
    { image: '/images/image.png', link: '/shop' },
    { image: '/images/image (1).png', link: '/shop' },
    { image: '/images/image (2).png', link: '/shop' },
    { image: '/images/image (3).png', link: '/shop' },
    { image: '/images/image (4).png', link: '/shop' },
];
