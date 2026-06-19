import { Suspense } from 'react';
import { getAdminCustomerList } from '@/services/customer.service';
import { CustomerList } from '@/components/admin/CustomerList';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';
import type { AdminCustomerFilters } from '@/types/admin-customer';

type SearchParams = Promise<Record<string, string | undefined>>;

export default function AdminCustomersPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <CustomersContent searchParams={searchParams} />
        </Suspense>
    );
}

async function CustomersContent({ searchParams }: { searchParams: SearchParams }) {
    await requireRole('admin');

    const params = await searchParams;

    const filters: AdminCustomerFilters = {
        search: params.search,
        page: params.page ? parseInt(params.page) : 1,
    };

    const result = await getAdminCustomerList(filters);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Customers</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    View and manage registered customers
                </p>
            </div>

            <CustomerList
                initialData={result.success && result.data ? result.data : null}
                currentSearch={filters.search ?? ''}
            />
        </div>
    );
}
