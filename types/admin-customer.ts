export type AdminCustomerListItem = {
    id: string;
    fullName: string | null;
    email: string | undefined;
    phone: string | null;
    role: 'admin' | 'shop_manager' | 'customer';
    deactivatedAt: string | null;
    orderCount: number;
    createdAt: string;
};

export type AdminCustomerFilters = {
    search?: string;
    page?: number;
};

export type AdminCustomerListResult = {
    customers: AdminCustomerListItem[];
    total: number;
    page: number;
    totalPages: number;
};

export type AdminCustomerDetail = {
    id: string;
    fullName: string | null;
    email: string | undefined;
    phone: string | null;
    role: 'admin' | 'shop_manager' | 'customer';
    avatarUrl: string | null;
    deactivatedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type AdminCustomerOrder = {
    id: string;
    status: string;
    paymentMethod: string;
    grandTotal: number;
    createdAt: string;
};

export type AdminCustomerOrdersResult = {
    orders: AdminCustomerOrder[];
    total: number;
    page: number;
    totalPages: number;
};
