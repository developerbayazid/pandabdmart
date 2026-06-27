-- Backfill purchase_price on existing product_variants (inventory-transferred only)
UPDATE public.product_variants pv
SET purchase_price = iv.purchase_price
FROM public.inventory_items ii
JOIN public.inventory_variants iv ON iv.inventory_item_id = ii.id
WHERE ii.status = 'transferred'
  AND pv.product_id = ii.transferred_to_product_id
  AND pv.sku = iv.sku
  AND pv.purchase_price IS NULL
  AND iv.deleted_at IS NULL;

-- Backfill purchase_price on existing order_items from their variant's purchase_price
UPDATE public.order_items oi
SET purchase_price = pv.purchase_price
FROM public.product_variants pv
WHERE oi.variant_id = pv.id
  AND oi.purchase_price IS NULL
  AND pv.purchase_price IS NOT NULL;
