import * as addressRepository from '@/repositories/address.repository';
import type { AddressInput } from '@/repositories/address.repository';

export type AddAddressInput = {
    userId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode?: string;
    isDefault?: boolean;
};

function validateAddress(input: Omit<AddAddressInput, 'userId'>): string | null {
    if (!input.name.trim()) return 'Name is required.';
    if (input.name.trim().length > 100) return 'Name must be 100 characters or fewer.';
    if (!input.phone.trim()) return 'Phone is required.';
    if (!input.address.trim()) return 'Address is required.';
    if (input.address.trim().length > 500) return 'Address must be 500 characters or fewer.';
    if (!input.city.trim()) return 'City is required.';
    if (!input.district.trim()) return 'District is required.';
    return null;
}

export async function addAddress(input: AddAddressInput): Promise<{ success: boolean; error?: string }> {
    const validationError = validateAddress(input);
    if (validationError) return { success: false, error: validationError };

    try {
        const repoInput: AddressInput = {
            name: input.name.trim(),
            phone: input.phone.trim(),
            address: input.address.trim(),
            city: input.city.trim(),
            district: input.district.trim(),
            postalCode: input.postalCode?.trim() || undefined,
            isDefault: input.isDefault ?? false,
        };
        await addressRepository.createAddress(input.userId, repoInput);
        return { success: true };
    } catch (err) {
        console.error('[services/address] addAddress', err);
        return { success: false, error: 'Failed to save address.' };
    }
}

export async function updateAddress(
    addressId: string,
    userId: string,
    input: Omit<AddAddressInput, 'userId'>,
): Promise<{ success: boolean; error?: string }> {
    const validationError = validateAddress(input);
    if (validationError) return { success: false, error: validationError };

    try {
        const repoInput: AddressInput = {
            name: input.name.trim(),
            phone: input.phone.trim(),
            address: input.address.trim(),
            city: input.city.trim(),
            district: input.district.trim(),
            postalCode: input.postalCode?.trim() || undefined,
            isDefault: input.isDefault ?? false,
        };
        await addressRepository.updateAddress(addressId, userId, repoInput);
        return { success: true };
    } catch (err) {
        console.error('[services/address] updateAddress', err);
        return { success: false, error: 'Failed to update address.' };
    }
}

export async function deleteAddress(addressId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await addressRepository.deleteAddress(addressId, userId);
        return { success: true };
    } catch (err) {
        console.error('[services/address] deleteAddress', err);
        return { success: false, error: 'Failed to delete address.' };
    }
}
