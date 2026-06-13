-- Storage RLS: product-images bucket
-- Public read (bucket-level), admin/manager write (RLS-enforced)

CREATE POLICY "admin_manager_insert_product_images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'shop_manager')
    )
);

CREATE POLICY "admin_manager_update_product_images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'shop_manager')
    )
)
WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'shop_manager')
    )
);

CREATE POLICY "admin_manager_delete_product_images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'shop_manager')
    )
);
