import { Suspense } from 'react';
import Link from 'next/link';
import { getInventoryList, getFormOptions } from '@/services/inventory.service';
import { InventoryList } from '@/components/admin/InventoryList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { InventoryFilters } from '@/types/admin-inventory';

type SearchParams = Promise<Record<string, string | undefined>>;

export default function InventoryPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <InventoryContent searchParams={searchParams} />
        </Suspense>
    );
}

async function InventoryContent({ searchParams }: { searchParams: SearchParams }) {
    await requireRole('admin', 'shop_manager');

    const params = await searchParams;

    const filters: InventoryFilters = {
        search: params.search,
        categoryId: params.category,
        brandId: params.brand,
        supplier: params.supplier,
        status: params.status,
        page: params.page ? parseInt(params.page) : 1,
    };

    const [listResult, optionsResult] = await Promise.all([
        getInventoryList(filters),
        getFormOptions(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[16px] font-semibold text-text-primary">Inventory</h1>
                    <p className="text-[14px] text-text-secondary mt-1">
                        Track internal products — supplier, purchase price, stock levels. Transfer items to the store when ready.
                    </p>
                </div>
                <Link
                    href="/admin/inventory/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-inverse text-text-inverse text-[14px] font-medium rounded-md hover:bg-surface-inverse-hover transition-colors"
                >
                    + Add Item
                </Link>
            </div>

            <InventoryList
                initialData={listResult.success && listResult.data ? listResult.data : null}
                filterOptions={optionsResult.success && optionsResult.data ? optionsResult.data : null}
                currentFilters={filters}
            />
        </div>
    );
}
