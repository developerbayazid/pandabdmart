export type AdminShippingZoneListItem = {
    id: string;
    name: string;
    cost: number;
    description: string | null;
    createdAt: string;
};

export type AdminShippingZoneFormData = {
    name: string;
    cost: number;
    description: string | null;
};
