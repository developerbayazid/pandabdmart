const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gufkxeuuzkyaqtavrcpr.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zmt4ZXV1emt5YXF0YXZyY3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM0NzM5NiwiZXhwIjoyMDk2OTIzMzk2fQ.0KEQ8hNkGB1Ws28-93xmQ42MoY_fTAD7wT0IAfdVATw';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

const categories = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Fashion', slug: 'fashion', path: 'fashion' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Electronics', slug: 'electronics', path: 'electronics' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Home & Living', slug: 'home-living', path: 'home-living' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'Beauty & Care', slug: 'beauty-care', path: 'beauty-care' },
];

const brands = [
    { id: '00000000-0000-0000-0000-000000000010', name: 'Urban Threads', slug: 'urban-threads' },
    { id: '00000000-0000-0000-0000-000000000011', name: 'Tech Zone', slug: 'tech-zone' },
    { id: '00000000-0000-0000-0000-000000000012', name: 'Digital Wave', slug: 'digital-wave' },
    { id: '00000000-0000-0000-0000-000000000013', name: 'Home Essentials', slug: 'home-essentials' },
    { id: '00000000-0000-0000-0000-000000000014', name: 'Bangla Craft', slug: 'bangla-craft' },
    { id: '00000000-0000-0000-0000-000000000015', name: 'Pure Glow', slug: 'pure-glow' },
];

const products = [
    {
        id: '10000000-0000-0000-0000-000000000001',
        category_id: '00000000-0000-0000-0000-000000000001',
        brand_id: '00000000-0000-0000-0000-000000000010',
        slug: 'classic-fit-cotton-tshirt',
        name: 'Classic Fit Cotton T-Shirt',
        description: 'Premium 100% cotton t-shirt with a relaxed classic fit. Breathable fabric perfect for everyday wear. Pre-shrunk to maintain shape after washing.',
        specs: { "Material": "100% Cotton", "Fit": "Classic", "Care": "Machine Wash Cold" },
        price: 899.00,
        compare_price: 1299.00,
        stock: 150,
        sku: 'URB-TSH-001',
        image: '/images/Product Card (1).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000002',
        category_id: '00000000-0000-0000-0000-000000000001',
        brand_id: '00000000-0000-0000-0000-000000000010',
        slug: 'slim-fit-denim-jeans',
        name: 'Slim Fit Denim Jeans',
        description: 'Modern slim-fit denim jeans crafted from premium stretch denim. Features five-pocket styling and a comfortable mid-rise waist.',
        specs: { "Material": "98% Cotton, 2% Elastane", "Fit": "Slim", "Rise": "Mid" },
        price: 1899.00,
        compare_price: 2499.00,
        stock: 80,
        sku: 'URB-DEN-002',
        image: '/images/Product Card (2).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000003',
        category_id: '00000000-0000-0000-0000-000000000001',
        brand_id: '00000000-0000-0000-0000-000000000014',
        slug: 'premium-leather-wallet',
        name: 'Premium Leather Wallet',
        description: 'Handcrafted genuine leather wallet with RFID blocking technology. Features 8 card slots, 2 bill compartments, and a coin pocket.',
        specs: { "Material": "Genuine Leather", "Card Slots": "8", "RFID Protection": "Yes" },
        price: 1299.00,
        compare_price: null,
        stock: 60,
        sku: 'BCR-WAL-003',
        image: '/images/Product Card (3).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000004',
        category_id: '00000000-0000-0000-0000-000000000002',
        brand_id: '00000000-0000-0000-0000-000000000011',
        slug: 'wireless-bluetooth-earbuds',
        name: 'Wireless Bluetooth Earbuds',
        description: 'True wireless earbuds with active noise cancellation. 30-hour total battery life with charging case. IPX5 water resistant.',
        specs: { "Battery": "30 hours total", "ANC": "Active", "Water Resistance": "IPX5" },
        price: 2499.00,
        compare_price: 3999.00,
        stock: 200,
        sku: 'TCZ-EAR-004',
        image: '/images/Product Card (4).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000005',
        category_id: '00000000-0000-0000-0000-000000000002',
        brand_id: '00000000-0000-0000-0000-000000000012',
        slug: 'smart-watch-pro',
        name: 'Smart Watch Pro',
        description: 'Advanced smartwatch with 1.8" AMOLED display, heart rate monitoring, SpO2 tracking, GPS, and 14-day battery life.',
        specs: { "Display": "1.8\" AMOLED", "Battery": "14 days", "Sensors": "HR, SpO2, GPS" },
        price: 3499.00,
        compare_price: 4999.00,
        stock: 45,
        sku: 'DGW-WTC-005',
        image: '/images/Product Card (5).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000006',
        category_id: '00000000-0000-0000-0000-000000000002',
        brand_id: '00000000-0000-0000-0000-000000000011',
        slug: 'usb-c-fast-charging-cable',
        name: 'USB-C Fast Charging Cable',
        description: 'Braided USB-C to USB-C cable supporting 65W fast charging and 480Mbps data transfer. 1.5m length with reinforced connectors.',
        specs: { "Length": "1.5m", "Charging": "65W PD", "Data": "480 Mbps" },
        price: 649.00,
        compare_price: null,
        stock: 300,
        sku: 'TCZ-CAB-006',
        image: '/images/Product Card (6).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000007',
        category_id: '00000000-0000-0000-0000-000000000003',
        brand_id: '00000000-0000-0000-0000-000000000014',
        slug: 'handwoven-jute-rug',
        name: 'Handwoven Jute Rug',
        description: 'Beautifully handwoven jute rug by local artisans. Natural fibers, reversible design, perfect for living rooms and entryways.',
        specs: { "Material": "Natural Jute", "Size": "120cm x 180cm", "Care": "Vacuum Only" },
        price: 4999.00,
        compare_price: null,
        stock: 15,
        sku: 'BCR-RUG-007',
        image: '/images/Product Card (7).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000008',
        category_id: '00000000-0000-0000-0000-000000000003',
        brand_id: '00000000-0000-0000-0000-000000000013',
        slug: 'ceramic-coffee-mug-set',
        name: 'Ceramic Coffee Mug Set',
        description: 'Set of 4 hand-glazed ceramic coffee mugs. Microwave and dishwasher safe. 350ml capacity with ergonomic handle.',
        specs: { "Material": "Ceramic", "Capacity": "350ml", "Set": "4 Mugs" },
        price: 1199.00,
        compare_price: 1599.00,
        stock: 90,
        sku: 'HES-MUG-008',
        image: '/images/Product Card.png',
    },
    {
        id: '10000000-0000-0000-0000-000000000009',
        category_id: '00000000-0000-0000-0000-000000000003',
        brand_id: '00000000-0000-0000-0000-000000000013',
        slug: 'led-desk-lamp',
        name: 'LED Desk Lamp',
        description: 'Modern LED desk lamp with 5 brightness levels, 3 color temperatures, USB charging port, and flexible gooseneck.',
        specs: { "Brightness": "5 levels", "Color Temp": "3000K-6500K", "Power": "12W" },
        price: 2299.00,
        compare_price: 2999.00,
        stock: 35,
        sku: 'HES-LMP-009',
        image: '/images/image (1).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000010',
        category_id: '00000000-0000-0000-0000-000000000004',
        brand_id: '00000000-0000-0000-0000-000000000015',
        slug: 'organic-face-serum',
        name: 'Organic Face Serum',
        description: 'Lightweight organic face serum with Vitamin C and hyaluronic acid. Brightens skin tone and provides deep hydration.',
        specs: { "Key Ingredients": "Vitamin C, Hyaluronic Acid", "Size": "30ml", "Skin Type": "All" },
        price: 1599.00,
        compare_price: 2199.00,
        stock: 70,
        sku: 'PGL-SRM-010',
        image: '/images/image (2).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000011',
        category_id: '00000000-0000-0000-0000-000000000004',
        brand_id: '00000000-0000-0000-0000-000000000015',
        slug: 'natural-lip-balm-trio',
        name: 'Natural Lip Balm Trio',
        description: 'Set of 3 natural lip balms in Rose, Mint, and Coconut flavors. Made with beeswax, shea butter, and coconut oil.',
        specs: { "Flavors": "Rose, Mint, Coconut", "Size": "3x 4.5g", "Base": "Beeswax & Shea Butter" },
        price: 649.00,
        compare_price: null,
        stock: 120,
        sku: 'PGL-LIP-011',
        image: '/images/image (3).png',
    },
    {
        id: '10000000-0000-0000-0000-000000000012',
        category_id: '00000000-0000-0000-0000-000000000004',
        brand_id: '00000000-0000-0000-0000-000000000015',
        slug: 'bamboo-hair-brush',
        name: 'Bamboo Hair Brush',
        description: 'Eco-friendly bamboo hair brush with natural boar bristles. Gentle on scalp, reduces frizz and static. Suitable for all hair types.',
        specs: { "Material": "Bamboo", "Bristles": "Natural Boar", "Suitable For": "All Hair Types" },
        price: 899.00,
        compare_price: 1199.00,
        stock: 55,
        sku: 'PGL-BRUSH-012',
        image: '/images/image (4).png',
    },
];

async function seed() {
    try {
        console.log('Seeding categories...');
        const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'id' });
        if (catErr) throw new Error(`Categories: ${catErr.message}`);
        console.log(`  ${categories.length} categories inserted.`);

        console.log('Seeding brands...');
        const { error: brandErr } = await supabase.from('brands').upsert(brands, { onConflict: 'id' });
        if (brandErr) throw new Error(`Brands: ${brandErr.message}`);
        console.log(`  ${brands.length} brands inserted.`);

        let inserted = 0;
        for (const p of products) {
            const { error: prodErr } = await supabase.from('products').upsert({
                id: p.id,
                category_id: p.category_id,
                brand_id: p.brand_id,
                slug: p.slug,
                type: 'simple',
                status: 'active',
                name: p.name,
                description: p.description,
                specs: p.specs,
            }, { onConflict: 'id' });
            if (prodErr) throw new Error(`Product ${p.slug}: ${prodErr.message}`);

            const variantId = p.id.replace('10000000', '20000000');
            const { error: varErr } = await supabase.from('product_variants').upsert({
                id: variantId,
                product_id: p.id,
                sku: p.sku,
                price: p.price,
                compare_price: p.compare_price,
                stock: p.stock,
                is_active: true,
            }, { onConflict: 'id' });
            if (varErr) throw new Error(`Variant ${p.sku}: ${varErr.message}`);

            const imageId = p.id.replace('10000000', '30000000');
            const { error: imgErr } = await supabase.from('variant_images').upsert({
                id: imageId,
                variant_id: variantId,
                url: p.image,
                is_primary: true,
                sort_order: 1,
            }, { onConflict: 'id' });
            if (imgErr) throw new Error(`Image ${p.sku}: ${imgErr.message}`);

            inserted++;
            console.log(`  [${inserted}/12] ${p.name} (${p.sku})`);
        }

        console.log('\nSeeding complete!');
        console.log(`  4 categories, 6 brands, ${inserted} products with variants and images.`);
    } catch (e) {
        console.error('SEED FAILED:', e.message);
        process.exit(1);
    }
}

seed();
