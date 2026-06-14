const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = 'https://gufkxeuuzkyaqtavrcpr.supabase.co';
let serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1Zmt4ZXV1emt5YXF0YXZyY3ByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM0NzM5NiwiZXhwIjoyMDk2OTIzMzk2fQ.0KEQ8hNkGB1Ws28-93xmQ42MoY_fTAD7wT0IAfdVATw';

if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = env.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
    const keyMatch = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) serviceRoleKey = keyMatch[1].trim();
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

const CATEGORIES = {
    FASHION: '00000000-0000-0000-0000-000000000001',
    ELECTRONICS: '00000000-0000-0000-0000-000000000002',
    HOME_LIVING: '00000000-0000-0000-0000-000000000003',
    BEAUTY_CARE: '00000000-0000-0000-0000-000000000004',
};

const BRANDS = {
    URBAN_THREADS: '00000000-0000-0000-0000-000000000010',
    TECH_ZONE: '00000000-0000-0000-0000-000000000011',
    DIGITAL_WAVE: '00000000-0000-0000-0000-000000000012',
    HOME_ESSENTIALS: '00000000-0000-0000-0000-000000000013',
    BANGLA_CRAFT: '00000000-0000-0000-0000-000000000014',
    PURE_GLOW: '00000000-0000-0000-0000-000000000015',
};

const attrs = (prefix, start, count) =>
    Array.from({ length: count }, (_, i) =>
        `b${prefix}-0000-4000-8000-${String(start + i).padStart(12, '0')}`
    );

const attributes = [
    {
        id: 'a0000000-0000-4000-8000-000000000001',
        name: 'Size',
        values: [
            { id: 'b0000000-0000-4000-8000-000000000001', value: 'Small' },
            { id: 'b0000000-0000-4000-8000-000000000002', value: 'Medium' },
            { id: 'b0000000-0000-4000-8000-000000000003', value: 'Large' },
            { id: 'b0000000-0000-4000-8000-000000000004', value: 'XL' },
            { id: 'b0000000-0000-4000-8000-000000000005', value: '30ml' },
            { id: 'b0000000-0000-4000-8000-000000000006', value: '50ml' },
            { id: 'b0000000-0000-4000-8000-000000000007', value: '100ml' },
            { id: 'b0000000-0000-4000-8000-000000000008', value: 'One Size' },
            { id: 'b0000000-0000-4000-8000-000000000009', value: 'Travel' },
        ],
    },
    {
        id: 'a0000000-0000-4000-8000-000000000002',
        name: 'Color',
        values: [
            { id: 'b0000000-0000-4000-8000-00000000000a', value: 'Black' },
            { id: 'b0000000-0000-4000-8000-00000000000b', value: 'White' },
            { id: 'b0000000-0000-4000-8000-00000000000c', value: 'Navy Blue' },
            { id: 'b0000000-0000-4000-8000-00000000000d', value: 'Brown' },
            { id: 'b0000000-0000-4000-8000-00000000000e', value: 'Rose Gold' },
            { id: 'b0000000-0000-4000-8000-00000000000f', value: 'Silver' },
            { id: 'b0000000-0000-4000-8000-000000000010', value: 'Matte Black' },
            { id: 'b0000000-0000-4000-8000-000000000011', value: 'Olive Green' },
            { id: 'b0000000-0000-4000-8000-000000000012', value: 'Natural' },
        ],
    },
    {
        id: 'a0000000-0000-4000-8000-000000000003',
        name: 'Storage',
        values: [
            { id: 'b0000000-0000-4000-8000-000000000013', value: '128GB' },
            { id: 'b0000000-0000-4000-8000-000000000014', value: '256GB' },
            { id: 'b0000000-0000-4000-8000-000000000015', value: '512GB' },
        ],
    },
    {
        id: 'a0000000-0000-4000-8000-000000000004',
        name: 'Flavor',
        values: [
            { id: 'b0000000-0000-4000-8000-000000000016', value: 'Mint' },
            { id: 'b0000000-0000-4000-8000-000000000017', value: 'Berry' },
            { id: 'b0000000-0000-4000-8000-000000000018', value: 'Citrus' },
        ],
    },
];

const products = [
    {
        id: '40000000-0000-4000-8000-000000000001',
        category_id: CATEGORIES.FASHION,
        brand_id: BRANDS.URBAN_THREADS,
        slug: 'premium-cotton-polo-shirt',
        name: 'Premium Cotton Polo Shirt',
        description: 'Classic polo shirt in premium pique cotton. Ribbed collar and cuffs, two-button placket, and a tailored fit. Perfect for casual and smart-casual occasions.',
        specs: { "Material": "Pique Cotton", "Fit": "Tailored", "Care": "Machine Wash Cold" },
        variants: [
            { sku: 'URB-POLO-BLK-S', price: 1499.00, compare_price: 1999.00, stock: 45, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000001', image: '/images/Product Card (1).png' },
            { sku: 'URB-POLO-BLK-M', price: 1499.00, compare_price: 1999.00, stock: 60, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000002', image: '/images/Product Card (1).png' },
            { sku: 'URB-POLO-BLK-L', price: 1499.00, compare_price: 1999.00, stock: 55, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Product Card (1).png' },
            { sku: 'URB-POLO-WHT-S', price: 1499.00, compare_price: 1999.00, stock: 40, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000001', image: '/images/Component 2.png' },
            { sku: 'URB-POLO-WHT-M', price: 1499.00, compare_price: 1999.00, stock: 50, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000002', image: '/images/Component 2.png' },
            { sku: 'URB-POLO-WHT-L', price: 1499.00, compare_price: 1999.00, stock: 35, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Component 2.png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000002',
        category_id: CATEGORIES.FASHION,
        brand_id: BRANDS.URBAN_THREADS,
        slug: 'stretch-chino-trousers',
        name: 'Stretch Chino Trousers',
        description: 'Slim-fit chinos with 2% elastane for all-day comfort. Features a mid-rise waist, zip fly, and slash pockets. Wrinkle-resistant fabric.',
        specs: { "Material": "98% Cotton, 2% Elastane", "Fit": "Slim", "Care": "Machine Wash Cold" },
        variants: [
            { sku: 'URB-CHINO-NVY-S', price: 2299.00, compare_price: null, stock: 30, color: 'b0000000-0000-4000-8000-00000000000c', size: 'b0000000-0000-4000-8000-000000000001', image: '/images/Component 3.png' },
            { sku: 'URB-CHINO-NVY-M', price: 2299.00, compare_price: null, stock: 40, color: 'b0000000-0000-4000-8000-00000000000c', size: 'b0000000-0000-4000-8000-000000000002', image: '/images/Component 3.png' },
            { sku: 'URB-CHINO-NVY-L', price: 2299.00, compare_price: null, stock: 35, color: 'b0000000-0000-4000-8000-00000000000c', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Component 3.png' },
            { sku: 'URB-CHINO-OLV-M', price: 2299.00, compare_price: null, stock: 25, color: 'b0000000-0000-4000-8000-000000000011', size: 'b0000000-0000-4000-8000-000000000002', image: '/images/Hero Product Image (1).png' },
            { sku: 'URB-CHINO-OLV-L', price: 2299.00, compare_price: null, stock: 20, color: 'b0000000-0000-4000-8000-000000000011', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Hero Product Image (1).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000003',
        category_id: CATEGORIES.FASHION,
        brand_id: BRANDS.BANGLA_CRAFT,
        slug: 'handcrafted-leather-belt',
        name: 'Handcrafted Leather Belt',
        description: 'Full-grain leather belt handcrafted by Bangladeshi artisans. Features a brushed nickel buckle, 35mm width, and 5 hole adjustments.',
        specs: { "Material": "Full-Grain Leather", "Width": "35mm", "Origin": "Handcrafted in Bangladesh" },
        variants: [
            { sku: 'BCR-BELT-BLK-32', price: 999.00, compare_price: 1299.00, stock: 40, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Hero Product Image (2).png' },
            { sku: 'BCR-BELT-BRN-32', price: 999.00, compare_price: 1299.00, stock: 35, color: 'b0000000-0000-4000-8000-00000000000d', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Hero Product Image.png' },
            { sku: 'BCR-BELT-BLK-36', price: 1049.00, compare_price: 1299.00, stock: 20, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Hero Product Image (2).png' },
            { sku: 'BCR-BELT-BRN-36', price: 1049.00, compare_price: 1299.00, stock: 15, color: 'b0000000-0000-4000-8000-00000000000d', size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Hero Product Image.png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000004',
        category_id: CATEGORIES.ELECTRONICS,
        brand_id: BRANDS.TECH_ZONE,
        slug: 'bluetooth-over-ear-headphones',
        name: 'Bluetooth Over-Ear Headphones',
        description: 'Premium wireless over-ear headphones with Hi-Res audio, active noise cancellation, and 40-hour battery life. Memory foam ear cushions with premium leatherette.',
        specs: { "Battery": "40 hours", "ANC": "Active", "Driver": "40mm Hi-Res" },
        variants: [
            { sku: 'TCZ-HDP-MBK', price: 4499.00, compare_price: 5999.00, stock: 25, color: 'b0000000-0000-4000-8000-000000000010', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Featured Product Image.png' },
            { sku: 'TCZ-HDP-WHT', price: 4199.00, compare_price: 5999.00, stock: 15, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Header Product Image.png' },
            { sku: 'TCZ-HDP-RSG', price: 4599.00, compare_price: 5999.00, stock: 10, color: 'b0000000-0000-4000-8000-00000000000e', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Promo Image.png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000005',
        category_id: CATEGORIES.ELECTRONICS,
        brand_id: BRANDS.DIGITAL_WAVE,
        slug: 'portable-bluetooth-speaker',
        name: 'Portable Bluetooth Speaker',
        description: 'Rugged portable speaker with 360-degree sound, IPX7 waterproof rating, and 20-hour battery. Built-in microphone for hands-free calls.',
        specs: { "Battery": "20 hours", "Waterproof": "IPX7", "Output": "30W 360°" },
        variants: [
            { sku: 'DGW-SPK-BLK', price: 2999.00, compare_price: 3999.00, stock: 35, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Component 5.png' },
            { sku: 'DGW-SPK-NVY', price: 2999.00, compare_price: 3999.00, stock: 20, color: 'b0000000-0000-4000-8000-00000000000c', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/image.png' },
            { sku: 'DGW-SPK-SLV', price: 3199.00, compare_price: 3999.00, stock: 10, color: 'b0000000-0000-4000-8000-00000000000f', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Product Card (4).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000006',
        category_id: CATEGORIES.ELECTRONICS,
        brand_id: BRANDS.TECH_ZONE,
        slug: 'wireless-charging-pad',
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charger supporting 15W for Samsung and 7.5W for iPhone. Slim design with LED indicator and foreign object detection.',
        specs: { "Output": "15W Fast Charging", "Compatibility": "Qi Standard", "Feature": "Foreign Object Detection" },
        variants: [
            { sku: 'TCZ-CHG-BLK', price: 899.00, compare_price: 1299.00, stock: 80, color: 'b0000000-0000-4000-8000-00000000000a', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Featured Product Image (1).png' },
            { sku: 'TCZ-CHG-WHT', price: 899.00, compare_price: 1299.00, stock: 65, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Featured Product Image (2).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000007',
        category_id: CATEGORIES.HOME_LIVING,
        brand_id: BRANDS.HOME_ESSENTIALS,
        slug: 'cotton-bed-sheet-set',
        name: 'Cotton Bed Sheet Set',
        description: 'Luxury 300-thread-count cotton sateen bed sheet set. Includes flat sheet, fitted sheet, and 2 pillowcases. Percale weave for a crisp, cool feel.',
        specs: { "Material": "Cotton Sateen", "Thread Count": "300", "Set": "4 Pieces" },
        variants: [
            { sku: 'HES-BED-WHT', price: 3499.00, compare_price: 4499.00, stock: 20, color: 'b0000000-0000-4000-8000-00000000000b', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Ethniq.png' },
            { sku: 'HES-BED-NVY', price: 3799.00, compare_price: 4499.00, stock: 15, color: 'b0000000-0000-4000-8000-00000000000c', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Hero Product Image (1).png' },
            { sku: 'HES-BED-MBK', price: 3799.00, compare_price: 4499.00, stock: 10, color: 'b0000000-0000-4000-8000-000000000010', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Product Card (7).png' },
            { sku: 'HES-BED-NTL', price: 3299.00, compare_price: 4499.00, stock: 8, color: 'b0000000-0000-4000-8000-000000000012', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/image (1).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000008',
        category_id: CATEGORIES.HOME_LIVING,
        brand_id: BRANDS.BANGLA_CRAFT,
        slug: 'woven-bamboo-basket-set',
        name: 'Woven Bamboo Basket Set',
        description: 'Set of 3 handwoven bamboo storage baskets in graduated sizes. Stackable design with natural finish. Perfect for storing blankets, toys, or pantry items.',
        specs: { "Material": "Natural Bamboo", "Set": "3 Baskets", "Care": "Wipe Clean" },
        variants: [
            { sku: 'BCR-BSK-SML', price: 1499.00, compare_price: null, stock: 25, size: 'b0000000-0000-4000-8000-000000000001', image: '/images/Hero Product Image (2).png' },
            { sku: 'BCR-BSK-MED', price: 1899.00, compare_price: null, stock: 20, size: 'b0000000-0000-4000-8000-000000000002', image: '/images/image (2).png' },
            { sku: 'BCR-BSK-LRG', price: 2299.00, compare_price: null, stock: 12, size: 'b0000000-0000-4000-8000-000000000003', image: '/images/image (3).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-000000000009',
        category_id: CATEGORIES.HOME_LIVING,
        brand_id: BRANDS.HOME_ESSENTIALS,
        slug: 'scented-soy-candle-set',
        name: 'Scented Soy Candle Set',
        description: 'Set of 3 hand-poured soy wax candles in natural glass jars. Available in Vanilla, Lavender, and Ocean Breeze. 40-hour burn time each.',
        specs: { "Material": "Soy Wax", "Burn Time": "40 hours each", "Wick": "Cotton" },
        variants: [
            { sku: 'HES-CND-SML', price: 799.00, compare_price: 999.00, stock: 50, size: 'b0000000-0000-4000-8000-000000000001', image: '/images/Product Card (5).png' },
            { sku: 'HES-CND-MED', price: 1299.00, compare_price: 1599.00, stock: 30, size: 'b0000000-0000-4000-8000-000000000002', image: '/images/Product Card (6).png' },
            { sku: 'HES-CND-LRG', price: 1899.00, compare_price: 2199.00, stock: 15, size: 'b0000000-0000-4000-8000-000000000003', image: '/images/Hero Image.png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-00000000000a',
        category_id: CATEGORIES.BEAUTY_CARE,
        brand_id: BRANDS.PURE_GLOW,
        slug: 'vitamin-c-face-wash',
        name: 'Vitamin C Face Wash',
        description: 'Gentle foaming face wash enriched with Vitamin C and aloe vera. Removes impurities while brightening skin tone. Suitable for all skin types, paraben-free.',
        specs: { "Key Ingredients": "Vitamin C, Aloe Vera", "Skin Type": "All", "Free From": "Parabens, Sulfates" },
        variants: [
            { sku: 'PGL-FWS-60', price: 599.00, compare_price: null, stock: 90, size: 'b0000000-0000-4000-8000-000000000005', image: '/images/Hero Product Image (2).png' },
            { sku: 'PGL-FWS-120', price: 999.00, compare_price: 1299.00, stock: 60, size: 'b0000000-0000-4000-8000-000000000006', image: '/images/image (2).png' },
            { sku: 'PGL-FWS-200', price: 1499.00, compare_price: 1899.00, stock: 40, size: 'b0000000-0000-4000-8000-000000000007', image: '/images/image.png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-00000000000b',
        category_id: CATEGORIES.BEAUTY_CARE,
        brand_id: BRANDS.PURE_GLOW,
        slug: 'natural-hair-oil-set',
        name: 'Natural Hair Oil Set',
        description: 'Set of 3 natural hair oils — Coconut, Argan, and Rosemary blend. Promotes hair growth, reduces dandruff, and adds natural shine.',
        specs: { "Ingredients": "Coconut, Argan, Rosemary", "Size": "Each 100ml", "Free From": "Silicones, Parabens" },
        variants: [
            { sku: 'PGL-OIL-COC', price: 799.00, compare_price: null, stock: 55, flavor: 'b0000000-0000-4000-8000-000000000016', image: '/images/Product Card (2).png' },
            { sku: 'PGL-OIL-BRY', price: 849.00, compare_price: null, stock: 40, flavor: 'b0000000-0000-4000-8000-000000000017', image: '/images/Product Card (3).png' },
            { sku: 'PGL-OIL-CTS', price: 899.00, compare_price: null, stock: 30, flavor: 'b0000000-0000-4000-8000-000000000018', image: '/images/image (4).png' },
        ],
    },
    {
        id: '40000000-0000-4000-8000-00000000000c',
        category_id: CATEGORIES.BEAUTY_CARE,
        brand_id: BRANDS.PURE_GLOW,
        slug: 'organic-body-lotion',
        name: 'Organic Body Lotion',
        description: 'Rich, fast-absorbing organic body lotion with shea butter, cocoa butter, and jojoba oil. Deeply moisturizes without greasy residue. 200ml bottle.',
        specs: { "Key Ingredients": "Shea Butter, Cocoa Butter, Jojoba Oil", "Size": "200ml", "Skin Type": "Dry to Normal" },
        variants: [
            { sku: 'PGL-LTN-NTL', price: 1299.00, compare_price: 1599.00, stock: 35, color: 'b0000000-0000-4000-8000-000000000012', size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Promo Image.png' },
            { sku: 'PGL-LTN-SNT', price: 1399.00, compare_price: 1699.00, stock: 25, size: 'b0000000-0000-4000-8000-000000000008', image: '/images/Product Card.png' },
        ],
    },
];

let variantCounter = 1;

function nextVariantId() {
    const hex = String(variantCounter++).padStart(12, '0');
    return `50000000-0000-4000-8000-${hex}`;
}

async function seed() {
    try {
        console.log('Seeding attributes...');
        for (const attr of attributes) {
            const { error: attrErr } = await supabase
                .from('attributes')
                .upsert({ id: attr.id, name: attr.name }, { onConflict: 'id' });
            if (attrErr) throw new Error(`Attribute ${attr.name}: ${attrErr.message}`);

            const { error: valErr } = await supabase
                .from('attribute_values')
                .upsert(attr.values.map(v => ({
                    id: v.id,
                    attribute_id: attr.id,
                    value: v.value,
                })), { onConflict: 'id' });
            if (valErr) throw new Error(`Values for ${attr.name}: ${valErr.message}`);
        }
        console.log(`  ${attributes.length} attributes with ${attributes.reduce((s, a) => s + a.values.length, 0)} values inserted.`);

        console.log('Seeding variable products...');
        let productCount = 0;
        let variantCount = 0;
        let imageCount = 0;

        for (const p of products) {
            const { error: prodErr } = await supabase
                .from('products')
                .upsert({
                    id: p.id,
                    category_id: p.category_id,
                    brand_id: p.brand_id,
                    slug: p.slug,
                    type: 'variable',
                    status: 'active',
                    name: p.name,
                    description: p.description,
                    specs: p.specs,
                }, { onConflict: 'id' });
            if (prodErr) throw new Error(`Product ${p.slug}: ${prodErr.message}`);
            productCount++;

            let variantIndex = 1;
            for (const v of p.variants) {
                const variantId = nextVariantId();
                const { error: varErr } = await supabase
                    .from('product_variants')
                    .upsert({
                        id: variantId,
                        product_id: p.id,
                        sku: v.sku,
                        price: v.price,
                        compare_price: v.compare_price || null,
                        stock: v.stock,
                        reserved_stock: 0,
                        sold_count: 0,
                        is_active: true,
                    }, { onConflict: 'id' });
                if (varErr) throw new Error(`Variant ${v.sku}: ${varErr.message}`);
                variantCount++;

                const attrValIds = [];
                if (v.color) attrValIds.push(v.color);
                if (v.size) attrValIds.push(v.size);
                if (v.flavor) attrValIds.push(v.flavor);

                if (attrValIds.length > 0) {
                    const { error: vavErr } = await supabase
                        .from('variant_attribute_values')
                        .upsert(
                            attrValIds.map(avid => ({
                                variant_id: variantId,
                                attribute_value_id: avid,
                            })),
                            { onConflict: 'variant_id, attribute_value_id' }
                        );
                    if (vavErr) throw new Error(`VariantAttributeValues ${v.sku}: ${vavErr.message}`);
                }

                const imageId = await nextImageId();
                const { error: imgErr } = await supabase
                    .from('variant_images')
                    .upsert({
                        id: imageId,
                        variant_id: variantId,
                        url: v.image,
                        is_primary: true,
                        sort_order: 1,
                    }, { onConflict: 'id' });
                if (imgErr) throw new Error(`Image ${v.sku}: ${imgErr.message}`);
                imageCount++;

                variantIndex++;
            }

            console.log(`  [${productCount}/12] ${p.name} (${p.variants.length} variants, ${p.variants.length} images)`);
        }

        console.log('\nSeeding complete!');
        console.log(`  ${attributes.length} attributes, ${attributes.reduce((s, a) => s + a.values.length, 0)} values`);
        console.log(`  ${productCount} variable products`);
        console.log(`  ${variantCount} variant SKUs`);
        console.log(`  ${imageCount} variant images`);
    } catch (e) {
        console.error('SEED FAILED:', e.message);
        process.exit(1);
    }
}

let imageCounter = 1;

async function nextImageId() {
    const hex = String(60000000 + imageCounter++).padStart(8, '0');
    return `${hex}-0000-4000-8000-000000000000`;
}

seed();
