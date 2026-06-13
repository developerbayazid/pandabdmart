import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProduct } from '@/components/home/FeaturedProduct';
import { ProductCards } from '@/components/home/ProductCards';
import { TrendingProducts } from '@/components/home/TrendingProducts';
import { CollectionGrid } from '@/components/home/CollectionGrid';
import { FestiveBanner } from '@/components/home/FestiveBanner';
import { RecentProducts } from '@/components/home/RecentProducts';
import { LatestNews } from '@/components/home/LatestNews';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
    return (
        <div className="flex flex-col min-h-full">
            <Navbar />
            <main className="flex-1">
                <HeroSection />
                <FeaturedProduct />
                <ProductCards />
                <TrendingProducts />
                <CollectionGrid />
                <FestiveBanner />
                <RecentProducts />
                <LatestNews />
            </main>
            <Footer />
        </div>
    );
}
