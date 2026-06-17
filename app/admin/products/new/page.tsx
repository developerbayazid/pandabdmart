import { getFormOptions } from '@/services/product.service';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireRole } from '@/lib/auth/require-role';

export default async function NewProductPage() {
    await requireRole('admin', 'shop_manager');

    const optionsResult = await getFormOptions();

    if (!optionsResult.success || !optionsResult.data) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <p className="text-[14px] text-text-secondary">
                    {optionsResult.error || 'Failed to load form data'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">New Product</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Create a new product in your catalog
                </p>
            </div>

            <ProductForm
                options={optionsResult.data}
                mode="create"
            />
        </div>
    );
}
