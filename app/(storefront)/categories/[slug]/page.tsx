import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getCategoryProducts, getCategoryFilterOptions } from '@/repositories/category.repository';
import { CategoryPageClient } from '@/components/category/CategoryPageClient';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { ShopFilters } from '@/types/shop';

export const revalidate = 120;

function parseSearchParam(value: string | string[] | undefined): string[] | undefined {
    if (!value) return undefined;
    if (Array.isArray(value)) return value.length > 0 ? value : undefined;
    return [value];
}

function parseNumberParam(value: string | string[] | undefined): number | undefined {
    const str = Array.isArray(value) ? value[0] : value;
    if (!str) return undefined;
    const num = parseInt(str, 10);
    return isNaN(num) ? undefined : num;
}

type PageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCategoryBySlug(slug);

    if (!data) {
        return { title: 'Category Not Found' };
    }

    return {
        title: `${data.category.name} - pandabdmart`,
        description: `Browse our collection of ${data.category.name.toLowerCase()} products. Quality items at great prices.`,
    };
}

export default function CategoryPage({ params, searchParams }: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CategoryContent params={params} searchParams={searchParams} />
        </Suspense>
    );
}

async function CategoryContent({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const sp = await searchParams;

    const categoryData = await getCategoryBySlug(slug);

    if (!categoryData) {
        notFound();
    }

    const filters: ShopFilters = {
        brands: parseSearchParam(sp.brand),
        minPrice: parseNumberParam(sp.minPrice),
        maxPrice: parseNumberParam(sp.maxPrice),
        inStockOnly: sp.stock === '1',
        search: parseSearchParam(sp.q)?.[0],
        sort: parseSearchParam(sp.sort)?.[0] ?? 'default',
        page: parseNumberParam(sp.page) ?? 1,
    };

    const [result, filterOptions] = await Promise.all([
        getCategoryProducts(slug, filters),
        getCategoryFilterOptions(),
    ]);

    return (
        <CategoryPageClient
            categoryData={categoryData}
            products={result.products}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
            filterOptions={filterOptions}
            categorySlug={slug}
        />
    );
}
