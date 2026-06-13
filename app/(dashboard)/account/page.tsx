import { requireAuth } from '@/lib/auth/require-auth';

export default async function AccountPage() {
    const user = await requireAuth();

    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                My Account
            </h2>
            <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-base font-semibold text-text-primary mb-4">Profile</h3>
                <div className="space-y-3">
                    <div>
                        <span className="text-xs text-text-secondary uppercase tracking-wide block mb-1">Name</span>
                        <span className="text-sm text-text-primary">{user.fullName || 'Not set'}</span>
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary uppercase tracking-wide block mb-1">Email</span>
                        <span className="text-sm text-text-primary">{user.email}</span>
                    </div>
                    <div>
                        <span className="text-xs text-text-secondary uppercase tracking-wide block mb-1">Role</span>
                        <span className="text-sm text-text-primary capitalize">{user.role.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
