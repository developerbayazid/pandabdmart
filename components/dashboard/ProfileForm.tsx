'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileAction } from '@/actions/user.actions';
import type { AuthUser } from '@/lib/auth/get-user';

type ProfileFormProps = {
    user: AuthUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
    const [state, formAction, pending] = useActionState(updateProfileAction, null);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="bg-error-light text-error-foreground text-sm p-3 rounded-md">
                    {state.error}
                </div>
            )}
            {state?.success && (
                <div className="bg-success-light text-success-foreground text-sm p-3 rounded-md">
                    Profile updated successfully.
                </div>
            )}
            <div>
                <label htmlFor="fullName" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Full Name
                </label>
                <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={user.fullName ?? ''}
                    placeholder="Your full name"
                />
            </div>
            <div>
                <label htmlFor="phone" className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Phone
                </label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={user.phone ?? ''}
                    placeholder="+8801XXXXXXXXX"
                />
            </div>
            <div>
                <label className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                    Email
                </label>
                <Input
                    value={user.email ?? ''}
                    disabled
                    className="opacity-60"
                />
            </div>
            <Button type="submit" disabled={pending}>
                {pending ? 'Saving...' : 'Save Changes'}
            </Button>
        </form>
    );
}
