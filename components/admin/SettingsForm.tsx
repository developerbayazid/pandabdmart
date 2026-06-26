'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Layout, Footprints, Image, Home, Globe, Package2, Grid3X3, Upload, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateStoreSettingsAction, searchProductsAction } from '@/actions/settings.actions';
import { uploadSettingsImage } from '@/lib/upload';
import type { AdminSettingsData } from '@/types/admin-settings';

type SettingsFormProps = {
    initialData: AdminSettingsData | null;
};

type Tab = 'general' | 'header' | 'footer' | 'hero' | 'homepage' | 'products' | 'collection' | 'seo';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'general', label: 'General', icon: Building2 },
    { key: 'header', label: 'Header', icon: Layout },
    { key: 'footer', label: 'Footer', icon: Footprints },
    { key: 'hero', label: 'Hero', icon: Image },
    { key: 'homepage', label: 'Homepage', icon: Home },
    { key: 'products', label: 'Products', icon: Package2 },
    { key: 'collection', label: 'Collection', icon: Grid3X3 },
    { key: 'seo', label: 'SEO & Inventory', icon: Globe },
];

export function SettingsForm({ initialData }: SettingsFormProps) {
    const router = useRouter();
    const settings = initialData;

    const [activeTab, setActiveTab] = useState<Tab>('general');

    const [form, setForm] = useState({
        storeName: settings?.storeName ?? '',
        storeEmail: settings?.storeEmail ?? '',
        storePhone: settings?.storePhone ?? '',
        storeAddress: settings?.storeAddress ?? '',
        logoUrl: settings?.logoUrl ?? '',
        faviconUrl: settings?.faviconUrl ?? '',
        headerAnnouncementEnabled: settings?.headerAnnouncementEnabled ?? false,
        headerAnnouncementText: settings?.headerAnnouncementText ?? '',
        headerAnnouncementCtaText: settings?.headerAnnouncementCtaText ?? '',
        headerAnnouncementCtaLink: settings?.headerAnnouncementCtaLink ?? '',
        headerBusinessHours: settings?.headerBusinessHours ?? '',
        footerTagline: settings?.footerTagline ?? '',
        footerCopyright: settings?.footerCopyright ?? '',
        facebookUrl: settings?.facebookUrl ?? '',
        instagramUrl: settings?.instagramUrl ?? '',
        youtubeUrl: settings?.youtubeUrl ?? '',
        footerTwitterUrl: settings?.footerTwitterUrl ?? '',
        footerLinkedinUrl: settings?.footerLinkedinUrl ?? '',
        heroTitle1: settings?.heroSlides[0]?.title ?? '',
        heroSubtitle1: settings?.heroSlides[0]?.subtitle ?? '',
        heroImage1: settings?.heroSlides[0]?.image ?? '',
        heroPrice1: settings?.heroSlides[0]?.price ?? '',
        heroTitle2: settings?.heroSlides[1]?.title ?? '',
        heroSubtitle2: settings?.heroSlides[1]?.subtitle ?? '',
        heroImage2: settings?.heroSlides[1]?.image ?? '',
        heroPrice2: settings?.heroSlides[1]?.price ?? '',
        heroTitle3: settings?.heroSlides[2]?.title ?? '',
        heroSubtitle3: settings?.heroSlides[2]?.subtitle ?? '',
        heroImage3: settings?.heroSlides[2]?.image ?? '',
        heroPrice3: settings?.heroSlides[2]?.price ?? '',
        heroCtaText: settings?.heroCtaText ?? '',
        heroCtaLink: settings?.heroCtaLink ?? '',
        homepageTrendingTitle: settings?.homepageTrendingTitle ?? '',
        homepageTrendingSubtitle: settings?.homepageTrendingSubtitle ?? '',
        homepageRecentTitle: settings?.homepageRecentTitle ?? '',
        homepageRecentSubtitle: settings?.homepageRecentSubtitle ?? '',
        homepageFestiveEyebrow: settings?.homepageFestiveEyebrow ?? '',
        homepageFestiveTitle: settings?.homepageFestiveTitle ?? '',
        homepageFestiveCtaText: settings?.homepageFestiveCtaText ?? '',
        homepageFestiveCtaLink: settings?.homepageFestiveCtaLink ?? '',
        homepageFestiveImage: settings?.homepageFestiveImage ?? '',
        homepageLatestNewsTitle: settings?.homepageLatestNewsTitle ?? '',
        homepageLatestNewsSubtitle: settings?.homepageLatestNewsSubtitle ?? '',
        homepageFeaturedProductId: settings?.homepageFeaturedProductId ?? '',
        homepageProductCardIds: (settings?.homepageProductCardIds ?? []).join(','),
        homepageTrendingProductIds: (settings?.homepageTrendingProductIds ?? []).join(','),
        homepageRecentProductIds: (settings?.homepageRecentProductIds ?? []).join(','),
        homepageCollectionImage1: settings?.homepageCollectionImages[0]?.image ?? '',
        homepageCollectionLink1: settings?.homepageCollectionImages[0]?.link ?? '',
        homepageCollectionImage2: settings?.homepageCollectionImages[1]?.image ?? '',
        homepageCollectionLink2: settings?.homepageCollectionImages[1]?.link ?? '',
        homepageCollectionImage3: settings?.homepageCollectionImages[2]?.image ?? '',
        homepageCollectionLink3: settings?.homepageCollectionImages[2]?.link ?? '',
        homepageCollectionImage4: settings?.homepageCollectionImages[3]?.image ?? '',
        homepageCollectionLink4: settings?.homepageCollectionImages[3]?.link ?? '',
        homepageCollectionImage5: settings?.homepageCollectionImages[4]?.image ?? '',
        homepageCollectionLink5: settings?.homepageCollectionImages[4]?.link ?? '',
        metaTitle: settings?.metaTitle ?? '',
        metaDescription: settings?.metaDescription ?? '',
        lowStockThreshold: settings?.lowStockThreshold ?? 5,
        stockReservationMinutes: settings?.stockReservationMinutes ?? 20,
        productsPerPage: settings?.productsPerPage ?? 20,
        showOutOfStock: settings?.showOutOfStock ?? false,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    if (!settings) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <div className="w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-[14px] text-text-secondary">
                    Store settings not configured yet. Run the migration to create the store_settings table.
                </p>
            </div>
        );
    }

    function updateField(field: string, value: string | number | boolean) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError(null);
        setSuccessMessage(null);
    }

    async function handleImageUpload(field: string) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploadingField(field);
            try {
                const url = await uploadSettingsImage(file);
                updateField(field, url);
            } catch {
                setError('Failed to upload image');
            } finally {
                setUploadingField(null);
            }
        };
        input.click();
    }

    async function handleSave() {
        if (!form.storeName.trim()) {
            setError('Store name is required');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        const result = await updateStoreSettingsAction(settings!.id, {
            ...form,
            lowStockThreshold: Number(form.lowStockThreshold) || 5,
            stockReservationMinutes: Number(form.stockReservationMinutes) || 20,
            productsPerPage: Number(form.productsPerPage) || 20,
            homepageProductCardIds: form.homepageProductCardIds,
            homepageTrendingProductIds: form.homepageTrendingProductIds,
            homepageRecentProductIds: form.homepageRecentProductIds,
        });

        if (result.success) {
            setSuccessMessage('Settings saved successfully');
            router.refresh();
        } else {
            setError(result.error ?? 'Failed to save settings');
        }
        setSaving(false);
    }

    const fieldClass = 'w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary';
    const labelClass = 'block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5';

    return (
        <div className="space-y-6">
            {error && <div className="bg-error-light border border-error/20 rounded-md px-4 py-3 text-[14px] text-error">{error}</div>}
            {successMessage && <div className="bg-success-light border border-success/20 rounded-md px-4 py-3 text-[14px] text-success-foreground">{successMessage}</div>}

            <div className="bg-surface border border-border rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <div className="flex border-b border-border overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2 ${
                                activeTab === tab.key ? 'text-text-primary border-text-primary' : 'text-text-secondary border-transparent hover:text-text-primary'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'general' && (
                        <TabContent title="General Information" icon={Building2}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClass}>Store Name</label><input type="text" value={form.storeName} onChange={(e) => updateField('storeName', e.target.value)} className={fieldClass} placeholder="PandaBDMart" /></div>
                                <div><label className={labelClass}>Store Email</label><input type="email" value={form.storeEmail} onChange={(e) => updateField('storeEmail', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>Store Phone</label><input type="text" value={form.storePhone} onChange={(e) => updateField('storePhone', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>Store Address</label><input type="text" value={form.storeAddress} onChange={(e) => updateField('storeAddress', e.target.value)} className={fieldClass} /></div>
                            </div>
                            <div className="border-t border-border mt-4 pt-4">
                                <p className="text-[14px] font-medium text-text-primary mb-3">Branding</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ImageField label="Logo" value={form.logoUrl} uploading={uploadingField === 'logoUrl'} onUpload={() => handleImageUpload('logoUrl')} onClear={() => updateField('logoUrl', '')} onChange={(v) => updateField('logoUrl', v)} fieldClass={fieldClass} labelClass={labelClass} />
                                    <ImageField label="Favicon" value={form.faviconUrl} uploading={uploadingField === 'faviconUrl'} onUpload={() => handleImageUpload('faviconUrl')} onClear={() => updateField('faviconUrl', '')} onChange={(v) => updateField('faviconUrl', v)} fieldClass={fieldClass} labelClass={labelClass} />
                                </div>
                            </div>
                        </TabContent>
                    )}

                    {activeTab === 'header' && (
                        <TabContent title="Header & Announcement Bar" icon={Layout}>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="announcementEnabled" checked={form.headerAnnouncementEnabled} onChange={(e) => updateField('headerAnnouncementEnabled', e.target.checked)} className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary" />
                                    <label htmlFor="announcementEnabled" className="text-[14px] font-medium text-text-primary">Enable Announcement Bar</label>
                                </div>
                                {form.headerAnnouncementEnabled && (
                                    <>
                                        <div><label className={labelClass}>Announcement Text</label><input type="text" value={form.headerAnnouncementText} onChange={(e) => updateField('headerAnnouncementText', e.target.value)} className={fieldClass} /></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>CTA Text</label><input type="text" value={form.headerAnnouncementCtaText} onChange={(e) => updateField('headerAnnouncementCtaText', e.target.value)} className={fieldClass} /></div>
                                            <div><label className={labelClass}>CTA Link</label><input type="text" value={form.headerAnnouncementCtaLink} onChange={(e) => updateField('headerAnnouncementCtaLink', e.target.value)} className={fieldClass} /></div>
                                        </div>
                                    </>
                                )}
                                <div className="border-t border-border pt-4">
                                    <label className={labelClass}>Business Hours Text</label><input type="text" value={form.headerBusinessHours} onChange={(e) => updateField('headerBusinessHours', e.target.value)} className={fieldClass} />
                                </div>
                            </div>
                        </TabContent>
                    )}

                    {activeTab === 'footer' && (
                        <TabContent title="Footer" icon={Footprints}>
                            <div className="grid grid-cols-1 gap-4">
                                <div><label className={labelClass}>Tagline / About Text</label><textarea value={form.footerTagline} onChange={(e) => updateField('footerTagline', e.target.value)} className={fieldClass} rows={3} /></div>
                                <div><label className={labelClass}>Copyright Text</label><input type="text" value={form.footerCopyright} onChange={(e) => updateField('footerCopyright', e.target.value)} className={fieldClass} /></div>
                            </div>
                            <div className="border-t border-border mt-4 pt-4">
                                <p className="text-[14px] font-medium text-text-primary mb-3">Social Media Links</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div><label className={labelClass}>Facebook URL</label><input type="url" value={form.facebookUrl} onChange={(e) => updateField('facebookUrl', e.target.value)} className={fieldClass} /></div>
                                    <div><label className={labelClass}>Twitter URL</label><input type="url" value={form.footerTwitterUrl} onChange={(e) => updateField('footerTwitterUrl', e.target.value)} className={fieldClass} /></div>
                                    <div><label className={labelClass}>Instagram URL</label><input type="url" value={form.instagramUrl} onChange={(e) => updateField('instagramUrl', e.target.value)} className={fieldClass} /></div>
                                    <div><label className={labelClass}>YouTube URL</label><input type="url" value={form.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} className={fieldClass} /></div>
                                    <div><label className={labelClass}>LinkedIn URL</label><input type="url" value={form.footerLinkedinUrl} onChange={(e) => updateField('footerLinkedinUrl', e.target.value)} className={fieldClass} /></div>
                                </div>
                            </div>
                        </TabContent>
                    )}

                    {activeTab === 'hero' && (
                        <TabContent title="Hero Section" icon={Image}>
                            {[1, 2, 3].map((slide) => (
                                <div key={slide} className={slide > 1 ? 'border-t border-border pt-6 mt-6' : ''}>
                                    {slide > 1 && <h3 className="text-[14px] font-semibold text-text-primary mb-4">Slide {slide}</h3>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className={labelClass}>Title</label><input type="text" value={form[`heroTitle${slide}` as keyof typeof form] as string} onChange={(e) => updateField(`heroTitle${slide}`, e.target.value)} className={fieldClass} /></div>
                                        <div><label className={labelClass}>Subtitle</label><input type="text" value={form[`heroSubtitle${slide}` as keyof typeof form] as string} onChange={(e) => updateField(`heroSubtitle${slide}`, e.target.value)} className={fieldClass} /></div>
                                        <ImageField label="Image" value={form[`heroImage${slide}` as keyof typeof form] as string} uploading={uploadingField === `heroImage${slide}`} onUpload={() => handleImageUpload(`heroImage${slide}`)} onClear={() => updateField(`heroImage${slide}`, '')} onChange={(v) => updateField(`heroImage${slide}`, v)} fieldClass={fieldClass} labelClass={labelClass} />
                                        <div><label className={labelClass}>Price Badge</label><input type="text" value={form[`heroPrice${slide}` as keyof typeof form] as string} onChange={(e) => updateField(`heroPrice${slide}`, e.target.value)} className={fieldClass} /></div>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t border-border mt-6 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClass}>CTA Button Text</label><input type="text" value={form.heroCtaText} onChange={(e) => updateField('heroCtaText', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>CTA Link</label><input type="text" value={form.heroCtaLink} onChange={(e) => updateField('heroCtaLink', e.target.value)} className={fieldClass} /></div>
                            </div>
                        </TabContent>
                    )}

                    {activeTab === 'homepage' && (
                        <TabContent title="Homepage Sections" icon={Home}>
                            <SectionSubheading label="Trending Products Section" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div><label className={labelClass}>Title</label><input type="text" value={form.homepageTrendingTitle} onChange={(e) => updateField('homepageTrendingTitle', e.target.value)} className={fieldClass} /></div><div><label className={labelClass}>Subtitle</label><input type="text" value={form.homepageTrendingSubtitle} onChange={(e) => updateField('homepageTrendingSubtitle', e.target.value)} className={fieldClass} /></div></div>
                            <SectionSubheading label="Recent Products Section" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"><div><label className={labelClass}>Title</label><input type="text" value={form.homepageRecentTitle} onChange={(e) => updateField('homepageRecentTitle', e.target.value)} className={fieldClass} /></div><div><label className={labelClass}>Subtitle</label><input type="text" value={form.homepageRecentSubtitle} onChange={(e) => updateField('homepageRecentSubtitle', e.target.value)} className={fieldClass} /></div></div>
                            <SectionSubheading label="Festive Banner Section" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div><label className={labelClass}>Eyebrow Label</label><input type="text" value={form.homepageFestiveEyebrow} onChange={(e) => updateField('homepageFestiveEyebrow', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>Title</label><input type="text" value={form.homepageFestiveTitle} onChange={(e) => updateField('homepageFestiveTitle', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>CTA Text</label><input type="text" value={form.homepageFestiveCtaText} onChange={(e) => updateField('homepageFestiveCtaText', e.target.value)} className={fieldClass} /></div>
                                <div><label className={labelClass}>CTA Link</label><input type="text" value={form.homepageFestiveCtaLink} onChange={(e) => updateField('homepageFestiveCtaLink', e.target.value)} className={fieldClass} /></div>
                                <ImageField label="Banner Image" value={form.homepageFestiveImage} uploading={uploadingField === 'homepageFestiveImage'} onUpload={() => handleImageUpload('homepageFestiveImage')} onClear={() => updateField('homepageFestiveImage', '')} onChange={(v) => updateField('homepageFestiveImage', v)} fieldClass={fieldClass} labelClass={labelClass} />
                            </div>
                            <SectionSubheading label="Latest News Section" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className={labelClass}>Title</label><input type="text" value={form.homepageLatestNewsTitle} onChange={(e) => updateField('homepageLatestNewsTitle', e.target.value)} className={fieldClass} /></div><div><label className={labelClass}>Subtitle</label><input type="text" value={form.homepageLatestNewsSubtitle} onChange={(e) => updateField('homepageLatestNewsSubtitle', e.target.value)} className={fieldClass} /></div></div>
                        </TabContent>
                    )}

                    {activeTab === 'products' && (
                        <ProductCurationTab form={form} updateField={updateField} fieldClass={fieldClass} labelClass={labelClass} />
                    )}

                    {activeTab === 'collection' && (
                        <TabContent title="Collection Grid" icon={Grid3X3}>
                            <p className="text-[13px] text-text-secondary mb-4">5 images displayed in a masonry grid on the homepage. Set each image and its link.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-surface-secondary border border-border rounded-xl p-4 space-y-3">
                                        <h3 className="text-[13px] font-semibold text-text-primary">Image {i}</h3>
                                        <ImageField
                                            label=""
                                            value={form[`homepageCollectionImage${i}` as keyof typeof form] as string}
                                            uploading={uploadingField === `collection${i}`}
                                            onUpload={() => handleImageUpload(`homepageCollectionImage${i}`)}
                                            onClear={() => updateField(`homepageCollectionImage${i}`, '')}
                                            onChange={(v) => updateField(`homepageCollectionImage${i}`, v)}
                                            fieldClass={fieldClass} labelClass={labelClass}
                                        />
                                        <div>
                                            <label className={labelClass}>Link URL</label>
                                            <input type="text" value={form[`homepageCollectionLink${i}` as keyof typeof form] as string} onChange={(e) => updateField(`homepageCollectionLink${i}`, e.target.value)} className={fieldClass} placeholder="/shop" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabContent>
                    )}

                    {activeTab === 'seo' && (
                        <TabContent title="SEO & Inventory" icon={Globe}>
                            <SectionSubheading label="SEO Metadata" />
                            <div className="grid grid-cols-1 gap-4 mb-6"><div><label className={labelClass}>Meta Title</label><input type="text" value={form.metaTitle} onChange={(e) => updateField('metaTitle', e.target.value)} className={fieldClass} /></div><div><label className={labelClass}>Meta Description</label><textarea value={form.metaDescription} onChange={(e) => updateField('metaDescription', e.target.value)} className={fieldClass} rows={3} /></div></div>
                            <SectionSubheading label="Product Display" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div><label className={labelClass}>Products Per Page</label><input type="number" min="4" max="100" value={form.productsPerPage} onChange={(e) => updateField('productsPerPage', Number(e.target.value))} className={fieldClass} /></div>
                                <div className="flex items-end pb-2"><div className="flex items-center gap-3"><input type="checkbox" id="showOutOfStock" checked={form.showOutOfStock} onChange={(e) => updateField('showOutOfStock', e.target.checked)} className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary" /><label htmlFor="showOutOfStock" className="text-[14px] font-medium text-text-primary">Show Out of Stock Products</label></div></div>
                            </div>
                            <SectionSubheading label="Inventory" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClass}>Low Stock Threshold</label><input type="number" min="1" value={form.lowStockThreshold} onChange={(e) => updateField('lowStockThreshold', Number(e.target.value))} className={fieldClass} /></div>
                                <div><label className={labelClass}>Stock Reservation (Minutes)</label><input type="number" min="1" value={form.stockReservationMinutes} onChange={(e) => updateField('stockReservationMinutes', Number(e.target.value))} className={fieldClass} /></div>
                            </div>
                        </TabContent>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </div>
    );
}

function TabContent({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <Icon className="w-4 h-4 text-text-secondary" />
                <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function SectionSubheading({ label }: { label: string }) {
    return <p className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mt-2 mb-3">{label}</p>;
}

function ImageField({ label, value, uploading, onUpload, onClear, onChange, fieldClass, labelClass }: {
    label: string;
    value: string;
    uploading: boolean;
    onUpload: () => void;
    onClear: () => void;
    onChange: (v: string) => void;
    fieldClass: string;
    labelClass: string;
}) {
    return (
        <div>
            {label && <label className={labelClass}>{label}</label>}
            <div className="flex items-center gap-2">
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} placeholder="/images/example.png or upload" />
                <button type="button" onClick={onUpload} disabled={uploading} className="shrink-0 px-3 py-2 text-[12px] font-medium bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-secondary disabled:opacity-50 transition-colors flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? '...' : 'Upload'}
                </button>
                {value && (
                    <button type="button" onClick={onClear} className="shrink-0 p-2 text-text-muted hover:text-error transition-colors"><X className="w-4 h-4" /></button>
                )}
            </div>
            {value && (
                <div className="mt-2 w-20 h-20 rounded-md border border-border overflow-hidden bg-surface-secondary">
                    <img src={value} alt={label ?? 'Preview'} className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
}

function ProductCurationTab({ form, updateField, fieldClass, labelClass }: {
    form: Record<string, string | number | boolean>;
    updateField: (field: string, value: string | number | boolean) => void;
    fieldClass: string;
    labelClass: string;
}) {
    const [searchResults, setSearchResults] = useState<Record<string, { id: string; name: string }[]>>({});
    const [searching, setSearching] = useState<string | null>(null);

    async function handleSearch(field: string, query: string) {
        if (query.length < 2) { setSearchResults((prev) => ({ ...prev, [field]: [] })); return; }
        setSearching(field);
        const result = await searchProductsAction(query);
        if (result.success && result.data) {
            setSearchResults((prev) => ({ ...prev, [field]: result.data! }));
        }
        setSearching(null);
    }

    function selectProduct(field: string, id: string) {
        updateField(field, id);
        setSearchResults((prev) => ({ ...prev, [field]: [] }));
    }

    return (
        <TabContent title="Product Curation" icon={Package2}>
            <p className="text-[13px] text-text-secondary mb-4">Choose which products display in each homepage section. Leave empty to show all products automatically. Use comma-separated UUIDs for multi-product sections.</p>

            <SectionSubheading label="Featured Product (single)" />
            <div className="mb-6">
                <label className={labelClass}>Product ID</label>
                <div className="relative">
                    <div className="flex gap-2">
                        <input type="text" value={form.homepageFeaturedProductId as string} onChange={(e) => { updateField('homepageFeaturedProductId', e.target.value); handleSearch('featured', e.target.value); }} className={fieldClass} placeholder="UUID or search by name..." />
                    </div>
                    {searchResults.featured && searchResults.featured.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.featured.map((p) => (
                                <button key={p.id} type="button" onClick={() => selectProduct('homepageFeaturedProductId', p.id)} className="w-full text-left px-3 py-2 text-[13px] text-text-primary hover:bg-surface-secondary transition-colors">
                                    {p.name} <span className="text-text-muted text-[11px] ml-2">{p.id}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SectionSubheading label="Product Cards Grid (comma-separated IDs)" />
            <div className="mb-6">
                <label className={labelClass}>Product IDs</label>
                <input type="text" value={form.homepageProductCardIds as string} onChange={(e) => updateField('homepageProductCardIds', e.target.value)} className={fieldClass} placeholder="UUID1, UUID2, UUID3" />
            </div>

            <SectionSubheading label="Trending Products (comma-separated IDs)" />
            <div className="mb-6">
                <label className={labelClass}>Product IDs</label>
                <input type="text" value={form.homepageTrendingProductIds as string} onChange={(e) => updateField('homepageTrendingProductIds', e.target.value)} className={fieldClass} placeholder="UUID1, UUID2, ... (leave empty to show all)" />
            </div>

            <SectionSubheading label="Recent Products (comma-separated IDs)" />
            <div>
                <label className={labelClass}>Product IDs</label>
                <input type="text" value={form.homepageRecentProductIds as string} onChange={(e) => updateField('homepageRecentProductIds', e.target.value)} className={fieldClass} placeholder="UUID1, UUID2, ... (leave empty to show all)" />
            </div>
        </TabContent>
    );
}
