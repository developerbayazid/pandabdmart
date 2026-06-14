export type ShopProduct = {
    id: string;
    slug: string;
    name: string;
    categorySlug: string;
    categoryName: string;
    brandSlug: string;
    brandName: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    image: string | null;
    description: string | null;
    rating: number;
    reviewCount: number;
    createdAt: string;
};

export type ShopFilters = {
    categories?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    search?: string;
    sort?: string;
    page?: number;
};

export type ShopPageResult = {
    products: ShopProduct[];
    total: number;
    page: number;
    totalPages: number;
};

export type ShopFilterOptions = {
    categories: { slug: string; name: string }[];
    brands: { slug: string; name: string }[];
    priceRange: { min: number; max: number };
};
