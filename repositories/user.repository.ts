import { createClient } from '@/lib/supabase/server';

export type UserProfileUpdate = {
    fullName?: string;
    phone?: string;
};

export async function updateProfile(userId: string, data: UserProfileUpdate): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, string> = {};
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;

    const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

    if (error) throw new Error('Failed to update profile.');
}
