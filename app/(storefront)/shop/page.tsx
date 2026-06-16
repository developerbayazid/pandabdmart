import { Suspense } from 'react';
import { getShopProducts, getShopFilterOptions } from '@/repositories/product.repository';
import { ShopPageClient } from '@/components/shop/ShopPageClient';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { ShopFilters } from '@/types/shop';

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
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function ShopPage({ searchParams }: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <ShopContent searchParams={searchParams} />
        </Suspense>
    );
}

async function ShopContent({ searchParams }: PageProps) {
    const params = await searchParams;

    const filters: ShopFilters = {
        categories: parseSearchParam(params.category),
        brands: parseSearchParam(params.brand),
        minPrice: parseNumberParam(params.minPrice),
        maxPrice: parseNumberParam(params.maxPrice),
        inStockOnly: params.stock === '1',
        search: parseSearchParam(params.q)?.[0],
        sort: parseSearchParam(params.sort)?.[0] ?? 'default',
        page: parseNumberParam(params.page) ?? 1,
    };

    const [result, filterOptions] = await Promise.all([
        getShopProducts(filters),
        getShopFilterOptions(),
    ]);

    return (
        <ShopPageClient
            products={result.products}
            total={result.total}
            page={result.page}
            totalPages={result.totalPages}
            filterOptions={filterOptions}
        />
    );
}
