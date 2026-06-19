import { Suspense } from 'react';
import { getAdminCouponList } from '@/services/coupon.service';
import { CouponList } from '@/components/admin/CouponList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { AdminCouponFilters } from '@/types/admin-coupon';

type SearchParams = Promise<Record<string, string | undefined>>;

export default function AdminCouponsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CouponsContent searchParams={searchParams} />
        </Suspense>
    );
}

async function CouponsContent({ searchParams }: { searchParams: SearchParams }) {
    await requireRole('admin');

    const params = await searchParams;

    const filters: AdminCouponFilters = {
        search: params.search,
        page: params.page ? parseInt(params.page) : 1,
    };

    const result = await getAdminCouponList(filters);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Coupons</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Create and manage discount coupons
                </p>
            </div>

            <CouponList
                initialData={result.success && result.data ? result.data : null}
                currentSearch={filters.search ?? ''}
            />
        </div>
    );
}
