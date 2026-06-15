export type CartItem = {
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    variantSku: string;
    variantAttributes: { attributeName: string; value: string }[];
    unitPrice: number;
    comparePrice: number | null;
    quantity: number;
    image: string | null;
    stock: number;
};

export type GuestCartItem = {
    variantId: string;
    productId: string;
    quantity: number;
    priceAtTime: number;
};

export type CartSummaryData = {
    subtotal: number;
    discount: number;
    couponCode: string | null;
    shippingEstimate: number;
    total: number;
    itemCount: number;
};

export type CartItemUpdate = {
    variantId: string;
    quantity: number;
};
