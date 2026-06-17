export type AdminProductListItem = {
    id: string;
    name: string;
    slug: string;
    type: 'simple' | 'variable';
    status: 'draft' | 'active' | 'archived';
    categoryName: string;
    brandName: string;
    variantCount: number;
    totalStock: number;
    minPrice: number | null;
    image: string | null;
    createdAt: string;
};

export type AdminProductFormData = {
    name: string;
    slug: string;
    type: 'simple' | 'variable';
    status: 'draft' | 'active' | 'archived';
    categoryId: string;
    brandId: string;
    description: string;
    specs: Record<string, unknown>;
};

export type AdminVariantFormData = {
    id?: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    isActive: boolean;
    attributeValueIds: string[];
    images: { url: string; isPrimary: boolean; sortOrder: number }[];
};

export type AdminCategoryOption = {
    id: string;
    name: string;
    fullPath: string;
};

export type AdminBrandOption = {
    id: string;
    name: string;
};

export type AdminAttributeOption = {
    id: string;
    name: string;
    values: { id: string; value: string }[];
};

export type AdminProductFilters = {
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: string;
    page?: number;
};

export type ProductFormOptions = {
    categories: AdminCategoryOption[];
    brands: AdminBrandOption[];
    attributes: AdminAttributeOption[];
};

export type AdminProductListResult = {
    products: AdminProductListItem[];
    total: number;
    page: number;
    totalPages: number;
};
