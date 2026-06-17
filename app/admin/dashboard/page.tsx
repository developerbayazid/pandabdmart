import { Suspense } from 'react';
import { getDashboardData } from '@/services/admin.service';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <DashboardContent />
        </Suspense>
    );
}

async function DashboardContent() {
    await requireRole('admin', 'shop_manager');

    const result = await getDashboardData();

    if (!result.success || !result.data) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <p className="text-[14px] text-text-secondary">
                    {result.error || 'Failed to load dashboard data'}
                </p>
            </div>
        );
    }

    return <AdminDashboard initialData={result.data} />;
}
