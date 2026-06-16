import { createClient } from '@/lib/supabase/server';

export type Address = {
    id: string;
    userId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AddressInput = {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode?: string;
    isDefault?: boolean;
};

export async function getAddresses(userId: string): Promise<Address[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch addresses.');

    return (data ?? []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        phone: row.phone,
        address: row.address,
        city: row.city,
        district: row.district,
        postalCode: row.postal_code ?? null,
        isDefault: row.is_default ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export async function createAddress(userId: string, input: AddressInput): Promise<Address> {
    const supabase = await createClient();

    if (input.isDefault) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const { data, error } = await supabase
        .from('addresses')
        .insert({
            user_id: userId,
            name: input.name,
            phone: input.phone,
            address: input.address,
            city: input.city,
            district: input.district,
            postal_code: input.postalCode ?? null,
            is_default: input.isDefault ?? false,
        })
        .select('*')
        .single();

    if (error) throw new Error('Failed to create address.');

    return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        district: data.district,
        postalCode: data.postal_code ?? null,
        isDefault: data.is_default ?? false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

export async function updateAddress(addressId: string, userId: string, input: AddressInput): Promise<void> {
    const supabase = await createClient();

    if (input.isDefault) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const updateData: Record<string, unknown> = {
        name: input.name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        district: input.district,
        postal_code: input.postalCode ?? null,
        is_default: input.isDefault ?? false,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('addresses')
        .update(updateData)
        .eq('id', addressId)
        .eq('user_id', userId);

    if (error) throw new Error('Failed to update address.');
}

export async function deleteAddress(addressId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

    if (error) throw new Error('Failed to delete address.');
}
