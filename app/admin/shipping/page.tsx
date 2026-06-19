import { Suspense } from 'react';
import { getAdminShippingZoneList } from '@/services/shipping.service';
import { ShippingZonesList } from '@/components/admin/ShippingZonesList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function AdminShippingPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <ShippingContent />
        </Suspense>
    );
}

async function ShippingContent() {
    await requireRole('admin');

    const result = await getAdminShippingZoneList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Shipping Zones</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Manage shipping zones and delivery costs
                </p>
            </div>

            <ShippingZonesList
                initialData={result.success && result.data ? result.data : null}
            />
        </div>
    );
}
