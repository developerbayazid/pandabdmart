import { Suspense } from 'react';
import Link from 'next/link';
import { getInventoryFormData } from '@/services/inventory.service';
import { InventoryForm } from '@/components/admin/InventoryForm';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

type Params = Promise<{ id: string }>;

export default function EditInventoryPage({
    params,
}: {
    params: Params;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <EditInventoryContent params={params} />
        </Suspense>
    );
}

async function EditInventoryContent({ params }: { params: Params }) {
    await requireRole('admin', 'shop_manager');

    const { id } = await params;
    const result = await getInventoryFormData(id);

    if (!result.success || !result.data) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <p className="text-[14px] text-text-secondary">
                    {result.error || 'Inventory item not found'}
                </p>
                <Link
                    href="/admin/inventory"
                    className="inline-block mt-3 text-[14px] text-text-secondary underline hover:text-text-primary"
                >
                    Back to Inventory
                </Link>
            </div>
        );
    }

    if (result.data.item?.status === 'transferred') {
        const productId = result.data.item.transferred_to_product_id as string | null;
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-[16px] font-semibold text-text-primary">
                        {result.data.item.name as string ?? 'Inventory Item'}
                    </h1>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-[14px] text-text-secondary mb-3">
                        This inventory item has been transferred and is now read-only.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        {productId && (
                            <Link
                                href={`/admin/products/${productId}/edit`}
                                className="inline-block px-4 py-2 bg-surface-inverse text-text-inverse text-[14px] font-medium rounded-md hover:bg-surface-inverse-hover transition-colors"
                            >
                                View Storefront Product
                            </Link>
                        )}
                        <Link
                            href="/admin/inventory"
                            className="text-[14px] text-text-secondary underline hover:text-text-primary"
                        >
                            Back to Inventory
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[16px] font-semibold text-text-primary">
                        Edit Inventory Item
                    </h1>
                    <p className="text-[14px] text-text-secondary mt-1">
                        {result.data.item?.name as string ?? 'Untitled'}
                    </p>
                </div>
                <Link
                    href="/admin/inventory"
                    className="text-[14px] text-text-secondary hover:text-text-primary transition-colors"
                >
                    &larr; Back to Inventory
                </Link>
            </div>

            <InventoryForm
                initialItem={result.data.item}
                options={result.data.options}
                mode="edit"
                itemId={id}
            />
        </div>
    );
}
