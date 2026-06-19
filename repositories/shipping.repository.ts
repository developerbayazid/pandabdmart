import { createClient } from '@/lib/supabase/server';
import type { AdminShippingZoneListItem, AdminShippingZoneFormData } from '@/types/admin-shipping';

export type ShippingZone = {
    id: string;
    name: string;
    cost: number;
    description?: string;
};

export async function getShippingZones(): Promise<ShippingZone[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('shipping_zones')
        .select('id, name, cost, description')
        .order('cost', { ascending: true });

    if (error) {
        console.error('[repositories/shipping] getShippingZones', error);
        return [];
    }

    return (data ?? []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        cost: Number(zone.cost),
        description: zone.description,
    }));
}

export async function getAdminShippingZones(): Promise<AdminShippingZoneListItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('shipping_zones')
        .select('id, name, cost, description, created_at')
        .order('cost', { ascending: true });

    if (error) {
        console.error('[repositories/shipping] getAdminShippingZones', error);
        return [];
    }

    return (data ?? []).map((zone) => ({
        id: zone.id,
        name: zone.name,
        cost: Number(zone.cost),
        description: zone.description,
        createdAt: zone.created_at,
    }));
}

export async function createShippingZone(
    data: AdminShippingZoneFormData,
): Promise<string> {
    const supabase = await createClient();

    const { data: created, error } = await supabase
        .from('shipping_zones')
        .insert({
            name: data.name,
            cost: data.cost,
            description: data.description || null,
        })
        .select('id')
        .single();

    if (error) throw error;
    return created.id;
}

export async function updateShippingZone(
    id: string,
    data: Partial<AdminShippingZoneFormData>,
): Promise<void> {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.description !== undefined) updateData.description = data.description || null;

    if (Object.keys(updateData).length === 0) return;

    const { error } = await supabase
        .from('shipping_zones')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

export async function deleteShippingZone(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
