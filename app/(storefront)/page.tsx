import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProduct } from '@/components/home/FeaturedProduct';
import { ProductCards } from '@/components/home/ProductCards';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionGrid } from '@/components/home/CollectionGrid';
import { FestiveBanner } from '@/components/home/FestiveBanner';
import { RecentProducts } from '@/components/home/RecentProducts';
import { LatestNews } from '@/components/home/LatestNews';

export default function Home() {
    return (
        <>
            <HeroSection />
            <FeaturedProduct />
            <ProductCards />
            <TrendingProducts />
            <CollectionGrid />
            <FestiveBanner />
            <RecentProducts />
            <LatestNews />
        </>
    );
}
