import { Suspense } from 'react';
import { getAdminSettingsData } from '@/services/settings.service';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function AdminSettingsPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <SettingsContent />
        </Suspense>
    );
}

async function SettingsContent() {
    await requireRole('admin');

    const result = await getAdminSettingsData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Store Settings</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    Manage store information, SEO, social media links, and inventory configuration
                </p>
            </div>

            <SettingsForm
                initialData={result.success && result.data ? result.data : null}
            />
        </div>
    );
}
