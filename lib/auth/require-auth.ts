import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import type { AuthUser } from '@/lib/auth/get-user';

export async function requireAuth(): Promise<AuthUser> {
    const user = await getUser();

    if (!user) {
        redirect('/signin');
    }

    return user;
}
