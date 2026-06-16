import * as userRepository from '@/repositories/user.repository';

export type UpdateProfileInput = {
    userId: string;
    fullName?: string;
    phone?: string;
};

export async function updateProfile(input: UpdateProfileInput): Promise<{ success: boolean; error?: string }> {
    if (input.fullName !== undefined && input.fullName.trim().length === 0) {
        return { success: false, error: 'Name is required.' };
    }

    if (input.fullName !== undefined && input.fullName.trim().length > 100) {
        return { success: false, error: 'Name must be 100 characters or fewer.' };
    }

    if (input.phone !== undefined && input.phone.trim() && !/^[+]?[\d\s-()]{7,20}$/.test(input.phone.trim())) {
        return { success: false, error: 'Please enter a valid phone number.' };
    }

    try {
        await userRepository.updateProfile(input.userId, {
            fullName: input.fullName?.trim(),
            phone: input.phone?.trim() || undefined,
        });
        return { success: true };
    } catch (err) {
        console.error('[services/user] updateProfile', err);
        return { success: false, error: 'Failed to update profile.' };
    }
}
