export type ProductVariant = {
    id: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    reservedStock: number;
    soldCount: number;
    isActive: boolean;
    images: { url: string; isPrimary: boolean; sortOrder: number }[];
    attributes: { attributeId: string; attributeName: string; valueId: string; value: string }[];
};

export type ProductAttribute = {
    id: string;
    name: string;
    values: { id: string; value: string }[];
};

export type ProductDetail = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    type: 'simple' | 'variable';
    status: string;
    brandName: string;
    brandSlug: string;
    categoryName: string;
    categorySlug: string;
    specs: Record<string, unknown> | null;
    variants: ProductVariant[];
    attributes: ProductAttribute[];
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];
};

export type ProductReview = {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
};

export type RelatedProduct = {
    id: string;
    slug: string;
    name: string;
    type: 'simple' | 'variable';
    variantId: string | null;
    price: number;
    comparePrice: number | null;
    image: string | null;
    categoryName: string;
    categorySlug: string;
    stock: number;
};

export type FaqItem = {
    question: string;
    answer: string;
};
