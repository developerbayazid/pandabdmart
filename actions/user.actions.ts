'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import { updateProfile } from '@/services/user.service';

export type UpdateProfileActionState = {
    success: boolean;
    error?: string;
};

export async function updateProfileAction(
    _prevState: UpdateProfileActionState | null,
    formData: FormData,
): Promise<UpdateProfileActionState> {
    const user = await requireAuth();

    const fullName = (formData.get('fullName') as string) ?? '';
    const phone = (formData.get('phone') as string) ?? '';

    const result = await updateProfile({
        userId: user.id,
        fullName,
        phone,
    });

    if (result.success) {
        revalidatePath('/account');
    }

    return result;
}
