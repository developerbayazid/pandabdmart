import { Suspense } from 'react';
import { getAdminBrandList } from '@/services/brand.service';
import { BrandList } from '@/components/admin/BrandList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { AdminBrandFilters } from '@/types/admin-catalog';

type SearchParams = Promise<Record<string, string | undefined>>;

export default function AdminBrandsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <BrandsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function BrandsContent({ searchParams }: { searchParams: SearchParams }) {
    await requireRole('admin', 'shop_manager');

    const params = await searchParams;

    const filters: AdminBrandFilters = {
        search: params.search,
        page: params.page ? parseInt(params.page) : 1,
    };

    const result = await getAdminBrandList(filters);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Brands</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Manage your brand catalog
                </p>
            </div>

            <BrandList
                initialData={result.success && result.data ? result.data : null}
                currentSearch={filters.search ?? ''}
            />
        </div>
    );
}
