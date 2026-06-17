import { getAdminProductList, getFormOptions } from '@/services/product.service';
import { ProductList } from '@/components/admin/ProductList';
import { requireRole } from '@/lib/auth/require-role';
import type { AdminProductFilters } from '@/types/admin-product';

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    await requireRole('admin', 'shop_manager');

    const params = await searchParams;

    const filters: AdminProductFilters = {
        search: params.search,
        categoryId: params.category,
        brandId: params.brand,
        status: params.status,
        page: params.page ? parseInt(params.page) : 1,
    };

    const [listResult, optionsResult] = await Promise.all([
        getAdminProductList(filters),
        getFormOptions(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[16px] font-semibold text-text-primary">Products</h1>
                    <p className="text-[14px] text-text-secondary mt-1">
                        Manage your product catalog
                    </p>
                </div>
                <a
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-inverse text-text-inverse text-[14px] font-medium rounded-md hover:bg-surface-inverse-hover transition-colors"
                >
                    + Add Product
                </a>
            </div>

            <ProductList
                initialData={listResult.success && listResult.data ? listResult.data : null}
                filterOptions={optionsResult.success && optionsResult.data ? optionsResult.data : null}
                currentFilters={filters}
            />
        </div>
    );
}
