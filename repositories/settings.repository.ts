import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { AdminSettingsData, AdminSettingsFormData, HeroSlide } from '@/types/admin-settings';

function parseJsonArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') {
        try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
    }
    return [];
}

function mapRowToSettings(row: Record<string, unknown>): AdminSettingsData {
    return {
        id: row.id as string,
        storeName: (row.store_name as string) ?? '',
        storeEmail: (row.store_email as string) ?? null,
        storePhone: (row.store_phone as string) ?? null,
        storeAddress: (row.store_address as string) ?? null,
        metaTitle: (row.meta_title as string) ?? null,
        metaDescription: (row.meta_description as string) ?? null,
        facebookUrl: (row.facebook_url as string) ?? null,
        instagramUrl: (row.instagram_url as string) ?? null,
        youtubeUrl: (row.youtube_url as string) ?? null,
        lowStockThreshold: (row.low_stock_threshold as number) ?? 5,
        stockReservationMinutes: (row.stock_reservation_minutes as number) ?? 20,
        logoUrl: (row.logo_url as string) ?? null,
        faviconUrl: (row.favicon_url as string) ?? null,
        updatedAt: row.updated_at as string,
        heroSlides: [
            { title: (row.hero_title_1 as string) ?? '', subtitle: (row.hero_subtitle_1 as string) ?? '', image: (row.hero_image_1 as string) ?? '', price: (row.hero_price_1 as string) ?? '' },
            { title: (row.hero_title_2 as string) ?? '', subtitle: (row.hero_subtitle_2 as string) ?? '', image: (row.hero_image_2 as string) ?? '', price: (row.hero_price_2 as string) ?? '' },
            { title: (row.hero_title_3 as string) ?? '', subtitle: (row.hero_subtitle_3 as string) ?? '', image: (row.hero_image_3 as string) ?? '', price: (row.hero_price_3 as string) ?? '' },
        ],
        heroCtaText: (row.hero_cta_text as string) ?? null,
        heroCtaLink: (row.hero_cta_link as string) ?? null,
        headerAnnouncementEnabled: (row.header_announcement_enabled as boolean) ?? false,
        headerAnnouncementText: (row.header_announcement_text as string) ?? null,
        headerAnnouncementCtaText: (row.header_announcement_cta_text as string) ?? null,
        headerAnnouncementCtaLink: (row.header_announcement_cta_link as string) ?? null,
        headerBusinessHours: (row.header_business_hours as string) ?? null,
        footerTagline: (row.footer_tagline as string) ?? null,
        footerCopyright: (row.footer_copyright as string) ?? null,
        footerTwitterUrl: (row.footer_twitter_url as string) ?? null,
        footerLinkedinUrl: (row.footer_linkedin_url as string) ?? null,
        productsPerPage: (row.products_per_page as number) ?? 20,
        showOutOfStock: (row.show_out_of_stock as boolean) ?? false,
        homepageTrendingTitle: (row.homepage_trending_title as string) ?? null,
        homepageTrendingSubtitle: (row.homepage_trending_subtitle as string) ?? null,
        homepageRecentTitle: (row.homepage_recent_title as string) ?? null,
        homepageRecentSubtitle: (row.homepage_recent_subtitle as string) ?? null,
        homepageFestiveEyebrow: (row.homepage_festive_eyebrow as string) ?? null,
        homepageFestiveTitle: (row.homepage_festive_title as string) ?? null,
        homepageFestiveCtaText: (row.homepage_festive_cta_text as string) ?? null,
        homepageFestiveCtaLink: (row.homepage_festive_cta_link as string) ?? null,
        homepageFestiveImage: (row.homepage_festive_image as string) ?? null,
        homepageLatestNewsTitle: (row.homepage_latest_news_title as string) ?? null,
        homepageLatestNewsSubtitle: (row.homepage_latest_news_subtitle as string) ?? null,
        homepageFeaturedProductId: (row.homepage_featured_product_id as string) ?? null,
        homepageProductCardIds: parseJsonArray(row.homepage_product_card_ids),
        homepageTrendingProductIds: parseJsonArray(row.homepage_trending_product_ids),
        homepageRecentProductIds: parseJsonArray(row.homepage_recent_product_ids),
        homepageCollectionImages: [
            { image: (row.homepage_collection_image_1 as string) ?? '', link: (row.homepage_collection_link_1 as string) ?? '' },
            { image: (row.homepage_collection_image_2 as string) ?? '', link: (row.homepage_collection_link_2 as string) ?? '' },
            { image: (row.homepage_collection_image_3 as string) ?? '', link: (row.homepage_collection_link_3 as string) ?? '' },
            { image: (row.homepage_collection_image_4 as string) ?? '', link: (row.homepage_collection_link_4 as string) ?? '' },
            { image: (row.homepage_collection_image_5 as string) ?? '', link: (row.homepage_collection_link_5 as string) ?? '' },
        ],
    };
}

const selectAll =
    'id, store_name, store_email, store_phone, store_address, meta_title, meta_description, facebook_url, instagram_url, youtube_url, low_stock_threshold, stock_reservation_minutes, logo_url, favicon_url, updated_at, hero_title_1, hero_subtitle_1, hero_image_1, hero_price_1, hero_title_2, hero_subtitle_2, hero_image_2, hero_price_2, hero_title_3, hero_subtitle_3, hero_image_3, hero_price_3, hero_cta_text, hero_cta_link, header_announcement_enabled, header_announcement_text, header_announcement_cta_text, header_announcement_cta_link, header_business_hours, footer_tagline, footer_copyright, footer_twitter_url, footer_linkedin_url, products_per_page, show_out_of_stock, homepage_trending_title, homepage_trending_subtitle, homepage_recent_title, homepage_recent_subtitle, homepage_festive_eyebrow, homepage_festive_title, homepage_festive_cta_text, homepage_festive_cta_link, homepage_festive_image, homepage_latest_news_title, homepage_latest_news_subtitle, homepage_featured_product_id, homepage_product_card_ids, homepage_trending_product_ids, homepage_recent_product_ids, homepage_collection_image_1, homepage_collection_link_1, homepage_collection_image_2, homepage_collection_link_2, homepage_collection_image_3, homepage_collection_link_3, homepage_collection_image_4, homepage_collection_link_4, homepage_collection_image_5, homepage_collection_link_5';

async function fetchSettings(): Promise<AdminSettingsData | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('store_settings').select(selectAll).limit(1).single();
    if (error) { console.error('[repositories/settings] fetchSettings:', error); return null; }
    return mapRowToSettings(data);
}

export const getPublicSettings = cache(fetchSettings);

export async function getAdminSettings(): Promise<AdminSettingsData | null> {
    return fetchSettings();
}

export async function updateSettings(id: string, data: Partial<AdminSettingsFormData>): Promise<void> {
    const supabase = await createClient();

    const fieldMap: Record<string, string> = {
        storeName: 'store_name', storeEmail: 'store_email', storePhone: 'store_phone', storeAddress: 'store_address',
        metaTitle: 'meta_title', metaDescription: 'meta_description',
        facebookUrl: 'facebook_url', instagramUrl: 'instagram_url', youtubeUrl: 'youtube_url',
        lowStockThreshold: 'low_stock_threshold', stockReservationMinutes: 'stock_reservation_minutes',
        logoUrl: 'logo_url', faviconUrl: 'favicon_url',
        heroTitle1: 'hero_title_1', heroSubtitle1: 'hero_subtitle_1', heroImage1: 'hero_image_1', heroPrice1: 'hero_price_1',
        heroTitle2: 'hero_title_2', heroSubtitle2: 'hero_subtitle_2', heroImage2: 'hero_image_2', heroPrice2: 'hero_price_2',
        heroTitle3: 'hero_title_3', heroSubtitle3: 'hero_subtitle_3', heroImage3: 'hero_image_3', heroPrice3: 'hero_price_3',
        heroCtaText: 'hero_cta_text', heroCtaLink: 'hero_cta_link',
        headerAnnouncementEnabled: 'header_announcement_enabled', headerAnnouncementText: 'header_announcement_text',
        headerAnnouncementCtaText: 'header_announcement_cta_text', headerAnnouncementCtaLink: 'header_announcement_cta_link',
        headerBusinessHours: 'header_business_hours',
        footerTagline: 'footer_tagline', footerCopyright: 'footer_copyright',
        footerTwitterUrl: 'footer_twitter_url', footerLinkedinUrl: 'footer_linkedin_url',
        productsPerPage: 'products_per_page', showOutOfStock: 'show_out_of_stock',
        homepageTrendingTitle: 'homepage_trending_title', homepageTrendingSubtitle: 'homepage_trending_subtitle',
        homepageRecentTitle: 'homepage_recent_title', homepageRecentSubtitle: 'homepage_recent_subtitle',
        homepageFestiveEyebrow: 'homepage_festive_eyebrow', homepageFestiveTitle: 'homepage_festive_title',
        homepageFestiveCtaText: 'homepage_festive_cta_text', homepageFestiveCtaLink: 'homepage_festive_cta_link',
        homepageFestiveImage: 'homepage_festive_image',
        homepageLatestNewsTitle: 'homepage_latest_news_title', homepageLatestNewsSubtitle: 'homepage_latest_news_subtitle',
        homepageFeaturedProductId: 'homepage_featured_product_id',
        homepageProductCardIds: 'homepage_product_card_ids',
        homepageTrendingProductIds: 'homepage_trending_product_ids',
        homepageRecentProductIds: 'homepage_recent_product_ids',
        homepageCollectionImage1: 'homepage_collection_image_1', homepageCollectionLink1: 'homepage_collection_link_1',
        homepageCollectionImage2: 'homepage_collection_image_2', homepageCollectionLink2: 'homepage_collection_link_2',
        homepageCollectionImage3: 'homepage_collection_image_3', homepageCollectionLink3: 'homepage_collection_link_3',
        homepageCollectionImage4: 'homepage_collection_image_4', homepageCollectionLink4: 'homepage_collection_link_4',
        homepageCollectionImage5: 'homepage_collection_image_5', homepageCollectionLink5: 'homepage_collection_link_5',
    };

    const textColumns = new Set([
        'storeEmail', 'storePhone', 'storeAddress', 'metaTitle', 'metaDescription',
        'facebookUrl', 'instagramUrl', 'youtubeUrl', 'logoUrl', 'faviconUrl',
        'heroCtaText', 'heroCtaLink', 'headerAnnouncementText', 'headerAnnouncementCtaText',
        'headerAnnouncementCtaLink', 'headerBusinessHours', 'footerTagline', 'footerCopyright',
        'footerTwitterUrl', 'footerLinkedinUrl', 'homepageTrendingTitle', 'homepageTrendingSubtitle',
        'homepageRecentTitle', 'homepageRecentSubtitle', 'homepageFestiveEyebrow', 'homepageFestiveTitle',
        'homepageFestiveCtaText', 'homepageFestiveCtaLink', 'homepageFestiveImage',
        'homepageLatestNewsTitle', 'homepageLatestNewsSubtitle',
        'heroTitle1', 'heroSubtitle1', 'heroImage1', 'heroPrice1',
        'heroTitle2', 'heroSubtitle2', 'heroImage2', 'heroPrice2',
        'heroTitle3', 'heroSubtitle3', 'heroImage3', 'heroPrice3',
        'homepageFeaturedProductId', 'homepageProductCardIds', 'homepageTrendingProductIds', 'homepageRecentProductIds',
        'homepageCollectionImage1', 'homepageCollectionLink1', 'homepageCollectionImage2', 'homepageCollectionLink2',
        'homepageCollectionImage3', 'homepageCollectionLink3', 'homepageCollectionImage4', 'homepageCollectionLink4',
        'homepageCollectionImage5', 'homepageCollectionLink5',
    ]);

    const updateData: Record<string, unknown> = {};
    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (data[camelKey as keyof AdminSettingsFormData] !== undefined) {
            const value = data[camelKey as keyof AdminSettingsFormData];
            updateData[snakeKey] = textColumns.has(camelKey) ? (value || null) : value;
        }
    }

    updateData.updated_at = new Date().toISOString();
    if (Object.keys(updateData).length <= 1) return;

    const { error } = await supabase.from('store_settings').update(updateData).eq('id', id);
    if (error) throw error;
}
