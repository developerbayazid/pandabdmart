import { Suspense } from 'react';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default async function AdminDashboardPage() {
    const user = await getUser();

    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        redirect('/');
    }

    return (
        <Suspense fallback={<PageSpinner />}>
            <AdminDashboardContent />
        </Suspense>
    );
}

function AdminDashboardContent() {
    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                Admin Dashboard
            </h2>
            <div className="bg-surface border border-border rounded-2xl p-6">
                <p className="text-sm text-text-secondary">Analytics and stats will appear here.</p>
            </div>
        </div>
    );
}
