import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/get-user';
import type { AuthUser } from '@/lib/auth/get-user';

type Role = 'admin' | 'shop_manager' | 'customer';

export async function requireRole(...allowedRoles: Role[]): Promise<AuthUser> {
    const user = await getUser();

    if (!user) {
        redirect('/signin');
    }

    if (!allowedRoles.includes(user.role)) {
        redirect('/');
    }

    return user;
}
