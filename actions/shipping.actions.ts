'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/get-user';
import {
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
} from '@/services/shipping.service';
import type { AdminShippingZoneFormData } from '@/types/admin-shipping';

async function getActorId(): Promise<string> {
    const user = await getUser();
    if (!user || !['admin'].includes(user.role)) {
        return '';
    }
    return user.id;
}

export async function createShippingZoneAction(
    data: AdminShippingZoneFormData,
): Promise<{ success: boolean; zoneId?: string; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await createShippingZone(actorId, data);
    if (result.success) {
        revalidatePath('/admin/shipping');
        revalidatePath('/checkout');
    }
    return result;
}

export async function updateShippingZoneAction(
    zoneId: string,
    data: Partial<AdminShippingZoneFormData>,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await updateShippingZone(actorId, zoneId, data);
    if (result.success) {
        revalidatePath('/admin/shipping');
        revalidatePath('/checkout');
    }
    return result;
}

export async function deleteShippingZoneAction(
    zoneId: string,
): Promise<{ success: boolean; error?: string }> {
    const actorId = await getActorId();
    if (!actorId) return { success: false, error: 'Not authenticated' };

    const result = await deleteShippingZone(actorId, zoneId);
    if (result.success) {
        revalidatePath('/admin/shipping');
        revalidatePath('/checkout');
    }
    return result;
}
