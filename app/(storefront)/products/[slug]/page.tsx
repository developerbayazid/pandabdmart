import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/repositories/product.repository';
import { ProductDetailPage } from '@/components/product/ProductDetailPage';
import { PageSpinner } from '@/components/ui/PageSpinner';

export const revalidate = 300;

type PageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return {
        title: `${product.name} - pandabdmart`,
        description: product.description ?? `Buy ${product.name} at pandabdmart. Quality products at great prices.`,
    };
}

export default function ProductPage({ params }: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <ProductContent params={params} />
        </Suspense>
    );
}

async function ProductContent({ params }: PageProps) {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categorySlug, product.slug, 4);

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
            <ProductDetailPage product={product} relatedProducts={relatedProducts} />
        </div>
    );
}
