export type AdminCategoryListItem = {
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    path: string | null;
    childrenCount: number;
    productCount: number;
};

export type AdminCategoryFilters = {
    search?: string;
};

export type AdminCategoryListResult = {
    categories: AdminCategoryListItem[];
    total: number;
};

export type AdminCategoryFormData = {
    name: string;
    slug: string;
    parentId: string | null;
};

export type AdminParentCategoryOption = {
    id: string;
    name: string;
    path: string | null;
    depth: number;
};

export type AdminBrandListItem = {
    id: string;
    name: string;
    slug: string;
    productCount: number;
    createdAt: string;
};

export type AdminBrandFilters = {
    search?: string;
    page?: number;
};

export type AdminBrandListResult = {
    brands: AdminBrandListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type AdminBrandFormData = {
    name: string;
    slug: string;
};
