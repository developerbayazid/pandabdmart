import { Suspense } from 'react';
import { getFormOptions } from '@/services/inventory.service';
import { InventoryForm } from '@/components/admin/InventoryForm';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function NewInventoryPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <NewInventoryContent />
        </Suspense>
    );
}

async function NewInventoryContent() {
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
                <h1 className="text-[16px] font-semibold text-text-primary">New Inventory Item</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Add a new item to your internal inventory tracking
                </p>
            </div>

            <InventoryForm
                options={optionsResult.data}
                mode="create"
            />
        </div>
    );
}
