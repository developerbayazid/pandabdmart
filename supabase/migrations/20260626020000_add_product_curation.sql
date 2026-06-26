-- Add product curation and collection grid customization columns

ALTER TABLE public.store_settings
    -- Product curation (admin picks specific products for each section)
    ADD COLUMN homepage_featured_product_id UUID,
    ADD COLUMN homepage_product_card_ids JSONB DEFAULT '[]',
    ADD COLUMN homepage_trending_product_ids JSONB DEFAULT '[]',
    ADD COLUMN homepage_recent_product_ids JSONB DEFAULT '[]',
    -- Collection grid (5 images with links)
    ADD COLUMN homepage_collection_image_1 TEXT DEFAULT '/images/image.png',
    ADD COLUMN homepage_collection_link_1 TEXT DEFAULT '/shop',
    ADD COLUMN homepage_collection_image_2 TEXT DEFAULT '/images/image (1).png',
    ADD COLUMN homepage_collection_link_2 TEXT DEFAULT '/shop',
    ADD COLUMN homepage_collection_image_3 TEXT DEFAULT '/images/image (2).png',
    ADD COLUMN homepage_collection_link_3 TEXT DEFAULT '/shop',
    ADD COLUMN homepage_collection_image_4 TEXT DEFAULT '/images/image (3).png',
    ADD COLUMN homepage_collection_link_4 TEXT DEFAULT '/shop',
    ADD COLUMN homepage_collection_image_5 TEXT DEFAULT '/images/image (4).png',
    ADD COLUMN homepage_collection_link_5 TEXT DEFAULT '/shop';

-- Set defaults on existing seed row
UPDATE public.store_settings SET
    homepage_product_card_ids = DEFAULT,
    homepage_trending_product_ids = DEFAULT,
    homepage_recent_product_ids = DEFAULT,
    homepage_collection_image_1 = DEFAULT,
    homepage_collection_link_1 = DEFAULT,
    homepage_collection_image_2 = DEFAULT,
    homepage_collection_link_2 = DEFAULT,
    homepage_collection_image_3 = DEFAULT,
    homepage_collection_link_3 = DEFAULT,
    homepage_collection_image_4 = DEFAULT,
    homepage_collection_link_4 = DEFAULT,
    homepage_collection_image_5 = DEFAULT,
    homepage_collection_link_5 = DEFAULT;
