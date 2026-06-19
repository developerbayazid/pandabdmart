export type AdminCouponListItem = {
    id: string;
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    minOrder: number;
    usageLimit: number;
    usedCount: number;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
};

export type AdminCouponFilters = {
    search?: string;
    page?: number;
};

export type AdminCouponListResult = {
    coupons: AdminCouponListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type AdminCouponFormData = {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    minOrder: number;
    usageLimit: number;
    expiresAt: string | null;
};
