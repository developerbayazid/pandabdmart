'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import { addAddress, updateAddress, deleteAddress } from '@/services/address.service';
import type { AddAddressInput } from '@/services/address.service';

export type AddressActionResult = {
    success: boolean;
    error?: string;
};

export async function addAddressAction(
    _prevState: AddressActionResult | null,
    formData: FormData,
): Promise<AddressActionResult> {
    const user = await requireAuth();

    const input: Omit<AddAddressInput, 'userId'> = {
        name: (formData.get('name') as string) ?? '',
        phone: (formData.get('phone') as string) ?? '',
        address: (formData.get('address') as string) ?? '',
        city: (formData.get('city') as string) ?? '',
        district: (formData.get('district') as string) ?? '',
        postalCode: (formData.get('postalCode') as string) ?? '',
        isDefault: formData.get('isDefault') === 'on',
    };

    const result = await addAddress({ userId: user.id, ...input });

    if (result.success) {
        revalidatePath('/account');
    }

    return result;
}

export async function updateAddressAction(
    _prevState: AddressActionResult | null,
    formData: FormData,
): Promise<AddressActionResult> {
    const user = await requireAuth();

    const addressId = (formData.get('addressId') as string) ?? '';

    const input: Omit<AddAddressInput, 'userId'> = {
        name: (formData.get('name') as string) ?? '',
        phone: (formData.get('phone') as string) ?? '',
        address: (formData.get('address') as string) ?? '',
        city: (formData.get('city') as string) ?? '',
        district: (formData.get('district') as string) ?? '',
        postalCode: (formData.get('postalCode') as string) ?? '',
        isDefault: formData.get('isDefault') === 'on',
    };

    const result = await updateAddress(addressId, user.id, input);

    if (result.success) {
        revalidatePath('/account');
    }

    return result;
}

export async function deleteAddressAction(addressId: string): Promise<AddressActionResult> {
    const user = await requireAuth();

    const result = await deleteAddress(addressId, user.id);

    if (result.success) {
        revalidatePath('/account');
    }

    return result;
}
