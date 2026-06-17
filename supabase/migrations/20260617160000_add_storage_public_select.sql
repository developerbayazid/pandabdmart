-- Add public SELECT policy on storage.objects for product-images bucket
-- This policy was missing in the initial migration — without it, anonymous users
-- cannot read images even though getPublicUrl() returns the correct URL.

CREATE POLICY "public_select_product_images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
