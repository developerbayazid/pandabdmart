export type InventoryItemListItem = {
    id: string;
    name: string;
    skuPrefix: string;
    type: 'simple' | 'variable';
    status: 'draft' | 'transferred';
    categoryName: string;
    brandName: string;
    supplier: string;
    purchasePrice: number;
    sellingPrice: number;
    totalStock: number;
    variantCount: number;
    warehouseLocation: string;
    reorderPoint: number;
    transferredToProductId: string | null;
    createdAt: string;
};

export type InventoryItemFormData = {
    name: string;
    skuPrefix: string;
    type: 'simple' | 'variable';
    categoryId: string;
    brandId: string;
    supplier: string;
    purchasePrice: number;
    sellingPrice: number;
    reorderPoint: number;
    warehouseLocation: string;
    notes: string;
};

export type InventoryVariantFormData = {
    id?: string;
    sku: string;
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    isActive: boolean;
};

export type InventoryFilters = {
    search?: string;
    categoryId?: string;
    brandId?: string;
    supplier?: string;
    status?: string;
    page?: number;
};

export type InventoryListResult = {
    items: InventoryItemListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type InventoryFormOptions = {
    categories: { id: string; name: string; fullPath: string }[];
    brands: { id: string; name: string }[];
    suppliers: string[];
};
