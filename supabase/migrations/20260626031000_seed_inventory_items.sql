-- Seed 35 inventory items with variants across categories and suppliers
-- Only runs if categories and brands exist (dev/staging only)

DO $$
DECLARE
    _cat_count integer;
    _brd_count integer;
    cat_tshirt UUID;
    cat_shirt UUID;
    cat_pant UUID;
    cat_jeans UUID;
    cat_jacket UUID;
    cat_sneakers UUID;
    cat_sandal UUID;
    cat_bag UUID;
    cat_watch UUID;
    cat_phone_case UUID;
    cat_headphone UUID;
    cat_charger UUID;
    cat_lamp UUID;
    cat_curtain UUID;
    cat_cushion UUID;
    cat_toy UUID;
    cat_detergent UUID;
    cat_oil UUID;
    cat_rice UUID;
    cat_coffee UUID;
    cat_biscuit UUID;
    brd_nike UUID;
    brd_samsung UUID;
    brd_xiaomi UUID;
    brd_local UUID;
    brd_unbranded UUID;
    item_id UUID;
BEGIN
    SELECT COUNT(*) INTO _cat_count FROM public.categories;
    SELECT COUNT(*) INTO _brd_count FROM public.brands;

    IF _cat_count = 0 OR _brd_count = 0 THEN
        RAISE NOTICE 'Skipping inventory seed — categories (%) or brands (%) not populated', _cat_count, _brd_count;
        RETURN;
    END IF;

    SELECT id INTO cat_tshirt FROM public.categories WHERE slug = 't-shirts' LIMIT 1;
    SELECT id INTO cat_shirt FROM public.categories WHERE slug = 'shirts' LIMIT 1;
    SELECT id INTO cat_pant FROM public.categories WHERE slug = 'pants' LIMIT 1;
    SELECT id INTO cat_jeans FROM public.categories WHERE slug = 'jeans' LIMIT 1;
    SELECT id INTO cat_jacket FROM public.categories WHERE slug = 'jackets' LIMIT 1;
    SELECT id INTO cat_sneakers FROM public.categories WHERE slug = 'sneakers' LIMIT 1;
    SELECT id INTO cat_sandal FROM public.categories WHERE slug = 'sandals' LIMIT 1;
    SELECT id INTO cat_bag FROM public.categories WHERE slug = 'bags' LIMIT 1;
    SELECT id INTO cat_watch FROM public.categories WHERE slug = 'watches' LIMIT 1;
    SELECT id INTO cat_phone_case FROM public.categories WHERE slug = 'phone-cases' LIMIT 1;
    SELECT id INTO cat_headphone FROM public.categories WHERE slug = 'headphones' LIMIT 1;
    SELECT id INTO cat_charger FROM public.categories WHERE slug = 'chargers-cables' LIMIT 1;
    SELECT id INTO cat_lamp FROM public.categories WHERE slug = 'lamps-lighting' LIMIT 1;
    SELECT id INTO cat_curtain FROM public.categories WHERE slug = 'curtains' LIMIT 1;
    SELECT id INTO cat_cushion FROM public.categories WHERE slug = 'cushions' LIMIT 1;
    SELECT id INTO cat_toy FROM public.categories WHERE slug = 'toys' LIMIT 1;
    SELECT id INTO cat_detergent FROM public.categories WHERE slug = 'detergents' LIMIT 1;
    SELECT id INTO cat_oil FROM public.categories WHERE slug = 'cooking-oil' LIMIT 1;
    SELECT id INTO cat_rice FROM public.categories WHERE slug = 'rice' LIMIT 1;
    SELECT id INTO cat_coffee FROM public.categories WHERE slug = 'coffee' LIMIT 1;
    SELECT id INTO cat_biscuit FROM public.categories WHERE slug = 'biscuits' LIMIT 1;

    SELECT id INTO brd_nike FROM public.brands WHERE slug = 'nike' LIMIT 1;
    SELECT id INTO brd_samsung FROM public.brands WHERE slug = 'samsung' LIMIT 1;
    SELECT id INTO brd_xiaomi FROM public.brands WHERE slug = 'xiaomi' LIMIT 1;
    SELECT id INTO brd_local FROM public.brands WHERE slug = 'local-brand' LIMIT 1;
    SELECT id INTO brd_unbranded FROM public.brands WHERE slug = 'unbranded' LIMIT 1;

    -- 1. Premium Cotton T-Shirt (variable — 3 sizes)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Premium Cotton T-Shirt', 'INV-TSH-PRM', 'variable', cat_tshirt, brd_nike, 'Dhaka Textile Ltd', 280.00, 599.00, 20, 'WH-01 Dhaka', 'Best-selling basic tee')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-PRM-S', 260.00, 599.00, 85);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-PRM-M', 280.00, 599.00, 120);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-PRM-L', 300.00, 649.00, 60);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-PRM-XL', 310.00, 649.00, 40);

    -- 2. Graphic Print Tee
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Graphic Print Tee', 'INV-TSH-GRF', 'simple', cat_tshirt, brd_local, 'Dhaka Textile Ltd', 200.00, 449.00, 15, 'WH-01 Dhaka', 'Streetwear graphic collection')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-GRF-001', 200.00, 449.00, 45);

    -- 3. Casual Linen Shirt (variable)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Casual Linen Shirt', 'INV-SHT-LIN', 'variable', cat_shirt, brd_local, 'Gazipur Garments', 450.00, 999.00, 10, 'WH-02 Gazipur', 'Summer collection')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SHT-LIN-M', 430.00, 999.00, 35);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SHT-LIN-L', 450.00, 999.00, 50);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SHT-LIN-XL', 470.00, 1099.00, 25);

    -- 4. Formal Oxford Shirt
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Formal Oxford Shirt', 'INV-SHT-OXF', 'simple', cat_shirt, brd_local, 'Gazipur Garments', 600.00, 1299.00, 8, 'WH-02 Gazipur', 'Office wear')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SHT-OXF-001', 600.00, 1299.00, 22);

    -- 5. Slim Fit Chinos (variable)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Slim Fit Chinos', 'INV-PAN-CHN', 'variable', cat_pant, brd_nike, 'Narayanganj Knitwear', 550.00, 1199.00, 12, 'WH-03 Narayanganj', 'Stretch fabric')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-PAN-CHN-30', 530.00, 1199.00, 18);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-PAN-CHN-32', 550.00, 1199.00, 28);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-PAN-CHN-34', 570.00, 1299.00, 15);

    -- 6. Classic Blue Jeans (variable)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Classic Blue Jeans', 'INV-JNS-CLS', 'variable', cat_jeans, brd_nike, 'Narayanganj Knitwear', 700.00, 1599.00, 10, 'WH-03 Narayanganj', 'Selvedge denim')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-CLS-30', 680.00, 1599.00, 12);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-CLS-32', 700.00, 1599.00, 20);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-CLS-34', 720.00, 1699.00, 8);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-CLS-36', 740.00, 1699.00, 5);

    -- 7. Denim Jacket
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Denim Jacket', 'INV-JKT-DNM', 'simple', cat_jacket, brd_nike, 'Narayanganj Knitwear', 1100.00, 2499.00, 5, 'WH-03 Narayanganj', 'Vintage wash')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JKT-DNM-001', 1100.00, 2499.00, 10);

    -- 8. Running Sneakers (variable = sizes)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Running Sneakers', 'INV-SNK-RUN', 'variable', cat_sneakers, brd_nike, 'Sports World BD', 1500.00, 3499.00, 8, 'WH-01 Dhaka', 'Lightweight mesh')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SNK-RUN-7', 1400.00, 3499.00, 12);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SNK-RUN-8', 1500.00, 3499.00, 20);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SNK-RUN-9', 1550.00, 3699.00, 15);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SNK-RUN-10', 1600.00, 3699.00, 8);

    -- 9. Leather Sandals
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Leather Sandals', 'INV-SDL-LTH', 'simple', cat_sandal, brd_local, 'Leather World BD', 600.00, 1399.00, 10, 'WH-01 Dhaka', 'Genuine leather')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SDL-LTH-001', 600.00, 1399.00, 25);

    -- 10. Backpack (variable = colors)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Travel Backpack 40L', 'INV-BAG-TRV', 'variable', cat_bag, brd_unbranded, 'Bag House BD', 800.00, 1799.00, 8, 'WH-01 Dhaka', 'Water resistant')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-BAG-TRV-BLK', 780.00, 1799.00, 12);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-BAG-TRV-GRY', 800.00, 1799.00, 8);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-BAG-TRV-NAV', 810.00, 1899.00, 6);

    -- 11. Smart Watch Band
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Silicone Watch Band 22mm', 'INV-WCH-BND', 'simple', cat_watch, brd_samsung, 'Gadget Zone BD', 120.00, 349.00, 30, 'WH-04 Chittagong', 'Universal fit')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-WCH-BND-001', 120.00, 349.00, 200);

    -- 12. TPU Phone Case (variable — models)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('TPU Clear Phone Case', 'INV-CAS-TPU', 'variable', cat_phone_case, brd_unbranded, 'Gadget Zone BD', 80.00, 249.00, 50, 'WH-04 Chittagong', 'Shockproof')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CAS-TPU-IP14', 75.00, 249.00, 90);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CAS-TPU-IP15', 80.00, 249.00, 110);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CAS-TPU-SS24', 85.00, 299.00, 70);

    -- 13. Wireless Earbuds
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Bluetooth 5.3 Earbuds', 'INV-HDP-BT5', 'simple', cat_headphone, brd_xiaomi, 'Gadget Zone BD', 900.00, 1899.00, 15, 'WH-04 Chittagong', 'ENC noise cancellation')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-HDP-BT5-001', 900.00, 1899.00, 55);

    -- 14. Fast Charger 33W
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Fast Charger 33W USB-C', 'INV-CHG-33W', 'simple', cat_charger, brd_xiaomi, 'Gadget Zone BD', 300.00, 599.00, 25, 'WH-04 Chittagong', 'PD compatible')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CHG-33W-001', 300.00, 599.00, 80);

    -- 15. USB-C Cable 2m
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('USB-C Cable 2m Braided', 'INV-CBL-2M', 'simple', cat_charger, brd_xiaomi, 'Gadget Zone BD', 120.00, 299.00, 40, 'WH-04 Chittagong', 'Fast charge support')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CBL-2M-001', 120.00, 299.00, 150);

    -- 16. LED Desk Lamp
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('LED Desk Lamp 3-Mode', 'INV-LMP-DSK', 'simple', cat_lamp, brd_unbranded, 'HomeStyle BD', 400.00, 899.00, 10, 'WH-05 Sylhet', 'Touch control')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-LMP-DSK-001', 400.00, 899.00, 30);

    -- 17. Blackout Curtain (variable — sizes)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Blackout Curtain', 'INV-CUR-BLK', 'variable', cat_curtain, brd_unbranded, 'HomeStyle BD', 500.00, 1199.00, 8, 'WH-05 Sylhet', '100% light blocking')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CUR-BLK-4FT', 480.00, 1199.00, 14);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CUR-BLK-6FT', 500.00, 1299.00, 10);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CUR-BLK-8FT', 550.00, 1499.00, 6);

    -- 18. Velvet Cushion Cover
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Velvet Cushion Cover 18x18', 'INV-CSH-VLV', 'simple', cat_cushion, brd_local, 'HomeStyle BD', 150.00, 349.00, 25, 'WH-05 Sylhet', 'Hidden zipper')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CSH-VLV-001', 150.00, 349.00, 60);

    -- 19. Stuffed Teddy Bear
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Stuffed Teddy Bear 15"', 'INV-TOY-TDY', 'simple', cat_toy, brd_unbranded, 'ToyLand BD', 250.00, 549.00, 20, 'WH-05 Sylhet', 'Soft plush')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TOY-TDY-001', 250.00, 549.00, 40);

    -- 20. Laundry Detergent 2kg
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Laundry Detergent 2kg', 'INV-DET-2KG', 'simple', cat_detergent, brd_local, 'Consumer BD Ltd', 220.00, 399.00, 30, 'WH-06 Khulna', 'Top load compatible')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-DET-2KG-001', 220.00, 399.00, 95);

    -- 21. Sunflower Cooking Oil 5L
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Sunflower Cooking Oil 5L', 'INV-OIL-5L', 'simple', cat_oil, brd_local, 'Consumer BD Ltd', 950.00, 1599.00, 20, 'WH-06 Khulna', 'Imported sunflower')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-OIL-5L-001', 950.00, 1599.00, 45);

    -- 22. Miniket Rice 25kg
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Miniket Rice 25kg', 'INV-RIC-25K', 'simple', cat_rice, brd_local, 'Consumer BD Ltd', 1450.00, 1899.00, 15, 'WH-06 Khulna', 'Polished premium')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-RIC-25K-001', 1450.00, 1899.00, 35);

    -- 23. Instant Coffee 100g
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Instant Coffee 100g', 'INV-COF-100', 'simple', cat_coffee, brd_local, 'Consumer BD Ltd', 180.00, 349.00, 25, 'WH-06 Khulna', 'Dark roast')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-COF-100-001', 180.00, 349.00, 70);

    -- 24. Digestive Biscuit 400g
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Digestive Biscuit 400g', 'INV-BSC-400', 'simple', cat_biscuit, brd_local, 'Consumer BD Ltd', 85.00, 179.00, 40, 'WH-06 Khulna', 'High fiber')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-BSC-400-001', 85.00, 179.00, 120);

    -- 25. Polo T-Shirt (variable)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Polo T-Shirt Pique', 'INV-TSH-POL', 'variable', cat_tshirt, brd_nike, 'Dhaka Textile Ltd', 350.00, 799.00, 12, 'WH-01 Dhaka', 'Pique knit collar')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-POL-M', 340.00, 799.00, 28);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-POL-L', 350.00, 799.00, 35);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-POL-XL', 370.00, 849.00, 18);

    -- 26. Sleeveless Vest
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Sleeveless Cotton Vest', 'INV-TSH-VST', 'simple', cat_tshirt, brd_local, 'Dhaka Textile Ltd', 120.00, 299.00, 20, 'WH-01 Dhaka', 'Summer essential')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-TSH-VST-001', 120.00, 299.00, 67);

    -- 27. Cargo Pants
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Cotton Cargo Pants', 'INV-PAN-CRG', 'simple', cat_pant, brd_nike, 'Narayanganj Knitwear', 650.00, 1399.00, 8, 'WH-03 Narayanganj', '6 pockets')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-PAN-CRG-001', 650.00, 1399.00, 14);

    -- 28. Slim Fit Jeans (variable)
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Slim Fit Black Jeans', 'INV-JNS-BLK', 'variable', cat_jeans, brd_nike, 'Narayanganj Knitwear', 650.00, 1499.00, 10, 'WH-03 Narayanganj', 'Stretch denim')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-BLK-30', 630.00, 1499.00, 10);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-BLK-32', 650.00, 1499.00, 16);
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-JNS-BLK-34', 670.00, 1599.00, 7);

    -- 29. Casual Sneakers
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Canvas Sneakers', 'INV-SNK-CVS', 'simple', cat_sneakers, brd_local, 'Sports World BD', 500.00, 1199.00, 10, 'WH-01 Dhaka', 'Vulcanized sole')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SNK-CVS-001', 500.00, 1199.00, 18);

    -- 30. Flip Flops
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('EVA Flip Flops', 'INV-SDL-FLP', 'simple', cat_sandal, brd_unbranded, 'Sports World BD', 150.00, 349.00, 30, 'WH-01 Dhaka', 'Waterproof')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-SDL-FLP-001', 150.00, 349.00, 80);

    -- 31. Laptop Sleeve
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Neoprene Laptop Sleeve 15"', 'INV-BAG-LAP', 'simple', cat_bag, brd_unbranded, 'Bag House BD', 250.00, 549.00, 15, 'WH-01 Dhaka', 'Shock absorbing')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-BAG-LAP-001', 250.00, 549.00, 32);

    -- 32. Over-Ear Headphones
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Over-Ear Headphones BT', 'INV-HDP-OVR', 'simple', cat_headphone, brd_samsung, 'Gadget Zone BD', 1800.00, 3499.00, 5, 'WH-04 Chittagong', '40mm drivers, ANC')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-HDP-OVR-001', 1800.00, 3499.00, 12);

    -- 33. Wireless Charger Pad
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Wireless Charger Pad 15W', 'INV-CHG-WLS', 'simple', cat_charger, brd_samsung, 'Gadget Zone BD', 500.00, 999.00, 15, 'WH-04 Chittagong', 'Qi certified')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-CHG-WLS-001', 500.00, 999.00, 28);

    -- 34. Aromatic Candle Set
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Aromatic Candle Set 3-Pack', 'INV-LMP-CND', 'simple', cat_lamp, brd_unbranded, 'HomeStyle BD', 200.00, 449.00, 20, 'WH-05 Sylhet', 'Soy wax, lavender')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-LMP-CND-001', 200.00, 449.00, 42);

    -- 35. Door Mat Coir
    INSERT INTO public.inventory_items (name, sku_prefix, type, category_id, brand_id, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes)
    VALUES ('Coir Door Mat 18x30', 'INV-MAT-COR', 'simple', cat_cushion, brd_unbranded, 'HomeStyle BD', 180.00, 399.00, 15, 'WH-05 Sylhet', 'Natural fiber')
    RETURNING id INTO item_id;
    INSERT INTO public.inventory_variants (inventory_item_id, sku, purchase_price, selling_price, stock) VALUES (item_id, 'INV-MAT-COR-001', 180.00, 399.00, 25);
END $$;
