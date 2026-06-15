import { createClient } from '@/lib/supabase/server';

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
