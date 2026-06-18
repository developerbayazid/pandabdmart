import { Suspense } from 'react';
import { getAdminCategories } from '@/services/category.service';
import { getCategoriesForParentSelect } from '@/repositories/category.repository';
import { CategoryTree } from '@/components/admin/CategoryTree';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function AdminCategoriesPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CategoriesContent />
        </Suspense>
    );
}

async function CategoriesContent() {
    await requireRole('admin', 'shop_manager');

    const [categoriesResult, parentOptions] = await Promise.all([
        getAdminCategories(),
        getCategoriesForParentSelect(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Categories</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Manage your category hierarchy
                </p>
            </div>

            <CategoryTree
                initialData={categoriesResult.success && categoriesResult.data ? categoriesResult.data : null}
                parentOptions={parentOptions}
            />
        </div>
    );
}
