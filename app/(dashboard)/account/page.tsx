import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/require-auth';
import type { AuthUser } from '@/lib/auth/get-user';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { AddressBook } from '@/components/dashboard/AddressBook';
import { getAddresses } from '@/repositories/address.repository';
import type { Address } from '@/repositories/address.repository';

export default async function AccountPage() {
    const user = await requireAuth();

    return (
        <Suspense fallback={<PageSpinner />}>
            <AccountContent user={user} />
        </Suspense>
    );
}

async function AccountContent({ user }: { user: AuthUser }) {
    let addresses: Address[] = [];
    try {
        addresses = await getAddresses(user.id);
    } catch {
        // errors logged in repository; show empty address book on failure
    }

    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                My Account
            </h2>
            <div className="space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="text-base font-semibold text-text-primary mb-4">Profile</h3>
                    <ProfileForm user={user} />
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <AddressBook addresses={addresses} />
                </div>
            </div>
        </div>
    );
}
