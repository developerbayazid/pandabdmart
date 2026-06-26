import { createClient } from '@/lib/supabase/client';

export async function uploadProductImage(
    file: File,
    productId: string,
    variantId: string,
): Promise<string> {
    const supabase = createClient();

    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `${variantId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${productId}/${fileName}`;

    const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        console.error('[lib/upload] uploadProductImage:', error);
        throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export async function uploadSettingsImage(file: File): Promise<string> {
    const supabase = createClient();

    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const fileName = `settings-${Date.now()}.${fileExt}`;
    const filePath = `settings/${fileName}`;

    const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        console.error('[lib/upload] uploadSettingsImage:', error);
        throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
