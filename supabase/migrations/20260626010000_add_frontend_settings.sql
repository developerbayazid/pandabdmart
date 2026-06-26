-- Add frontend customization columns to store_settings + public read policy

ALTER TABLE public.store_settings
    -- Hero section
    ADD COLUMN hero_title_1 TEXT DEFAULT 'A model wearing your best Panjabi design.',
    ADD COLUMN hero_subtitle_1 TEXT DEFAULT 'Elevate Your Style with Our Finest Panjabi Collection.',
    ADD COLUMN hero_image_1 TEXT DEFAULT '/images/Hero Product Image.png',
    ADD COLUMN hero_price_1 TEXT DEFAULT '$45',
    ADD COLUMN hero_title_2 TEXT DEFAULT 'Traditional elegance meets modern style.',
    ADD COLUMN hero_subtitle_2 TEXT DEFAULT 'Discover our premium collection of handcrafted panjabis.',
    ADD COLUMN hero_image_2 TEXT DEFAULT '/images/Hero Product Image (1).png',
    ADD COLUMN hero_price_2 TEXT DEFAULT '$52',
    ADD COLUMN hero_title_3 TEXT DEFAULT 'Crafted with precision and passion.',
    ADD COLUMN hero_subtitle_3 TEXT DEFAULT 'Experience the finest fabrics and intricate designs.',
    ADD COLUMN hero_image_3 TEXT DEFAULT '/images/Hero Product Image (2).png',
    ADD COLUMN hero_price_3 TEXT DEFAULT '$48',
    ADD COLUMN hero_cta_text TEXT DEFAULT 'Shop Now',
    ADD COLUMN hero_cta_link TEXT DEFAULT '/shop',
    -- Header / Navbar
    ADD COLUMN header_announcement_enabled BOOLEAN DEFAULT false,
    ADD COLUMN header_announcement_text TEXT DEFAULT 'UP TO 40% OFF BEST SELLING PANJABI',
    ADD COLUMN header_announcement_cta_text TEXT DEFAULT 'SHOP NOW',
    ADD COLUMN header_announcement_cta_link TEXT DEFAULT '/shop',
    ADD COLUMN header_business_hours TEXT DEFAULT 'OPEN 9AM TO 9PM / (123) 456-7890',
    -- Footer
    ADD COLUMN footer_tagline TEXT DEFAULT 'Where tradition meets style. Discover premium Panjabis & ethnic wear crafted for elegance and comfort!',
    ADD COLUMN footer_copyright TEXT DEFAULT 'Copyright © 2025. All Rights Reserved',
    ADD COLUMN footer_twitter_url TEXT,
    ADD COLUMN footer_linkedin_url TEXT,
    -- Product display
    ADD COLUMN products_per_page INTEGER DEFAULT 20,
    ADD COLUMN show_out_of_stock BOOLEAN DEFAULT false,
    -- Homepage section headings
    ADD COLUMN homepage_trending_title TEXT DEFAULT 'Trending Products',
    ADD COLUMN homepage_trending_subtitle TEXT DEFAULT 'Discover the Most Wanted Styles — Shop Our Bestselling Picks Now!',
    ADD COLUMN homepage_recent_title TEXT DEFAULT 'Recent Products',
    ADD COLUMN homepage_recent_subtitle TEXT DEFAULT 'Explore Our Latest Arrivals — Fresh Styles Just In!',
    ADD COLUMN homepage_festive_eyebrow TEXT DEFAULT 'Festive Special:',
    ADD COLUMN homepage_festive_title TEXT DEFAULT 'Flat 30% Off on All Panjabis',
    ADD COLUMN homepage_festive_cta_text TEXT DEFAULT 'Shop Now',
    ADD COLUMN homepage_festive_cta_link TEXT DEFAULT '/shop',
    ADD COLUMN homepage_festive_image TEXT DEFAULT '/images/Header Product Image.png',
    ADD COLUMN homepage_latest_news_title TEXT DEFAULT 'Latest News',
    ADD COLUMN homepage_latest_news_subtitle TEXT DEFAULT 'Style Insights: Fashion Tips & Trends';

-- Update seed row with new defaults
UPDATE public.store_settings SET
    hero_title_1 = DEFAULT,
    hero_subtitle_1 = DEFAULT,
    hero_image_1 = DEFAULT,
    hero_price_1 = DEFAULT,
    hero_title_2 = DEFAULT,
    hero_subtitle_2 = DEFAULT,
    hero_image_2 = DEFAULT,
    hero_price_2 = DEFAULT,
    hero_title_3 = DEFAULT,
    hero_subtitle_3 = DEFAULT,
    hero_image_3 = DEFAULT,
    hero_price_3 = DEFAULT,
    hero_cta_text = DEFAULT,
    hero_cta_link = DEFAULT,
    header_announcement_enabled = DEFAULT,
    header_announcement_text = DEFAULT,
    header_announcement_cta_text = DEFAULT,
    header_announcement_cta_link = DEFAULT,
    header_business_hours = DEFAULT,
    footer_tagline = DEFAULT,
    footer_copyright = DEFAULT,
    footer_twitter_url = DEFAULT,
    footer_linkedin_url = DEFAULT,
    products_per_page = DEFAULT,
    show_out_of_stock = DEFAULT,
    homepage_trending_title = DEFAULT,
    homepage_trending_subtitle = DEFAULT,
    homepage_recent_title = DEFAULT,
    homepage_recent_subtitle = DEFAULT,
    homepage_festive_eyebrow = DEFAULT,
    homepage_festive_title = DEFAULT,
    homepage_festive_cta_text = DEFAULT,
    homepage_festive_cta_link = DEFAULT,
    homepage_festive_image = DEFAULT,
    homepage_latest_news_title = DEFAULT,
    homepage_latest_news_subtitle = DEFAULT;

-- Allow public read access so frontend can display settings
CREATE POLICY "Public can read store_settings" ON public.store_settings
    FOR SELECT TO anon, authenticated
    USING (true);
