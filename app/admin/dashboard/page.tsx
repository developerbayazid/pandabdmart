import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    const user = await getUser();

    if (!user || !['admin', 'shop_manager'].includes(user.role)) {
        redirect('/');
    }

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
