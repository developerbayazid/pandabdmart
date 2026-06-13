export type ShopProduct = {
    id: number;
    category: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    color: string;
    inStock: boolean;
    rating: number;
    reviewCount: number;
};

export const categories = ['Panjabi', 'Perfume', 'Footwear', 'Trouser'] as const;

export const colors = [
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Brown', hex: '#92400e' },
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'Orange', hex: '#f97316' },
] as const;

export const tags = ['Panjabi', 'Footwear', 'Perfume', 'Trouser'] as const;

export const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'New Arrivals' },
    { value: 'popular', label: 'Popular' },
    { value: 'rating', label: 'Best Rating' },
] as const;

export const mockProducts: ShopProduct[] = [
    {
        id: 1,
        category: 'Panjabi',
        name: "Semi Fit Panjabi - Charcoal",
        price: 24.00,
        image: '/images/Product Card.png',
        color: 'Black',
        inStock: true,
        rating: 4,
        reviewCount: 12,
    },
    {
        id: 2,
        category: 'Perfume',
        name: "Al Haramain Hayati Gold",
        price: 24.00,
        image: '/images/Product Card (2).png',
        color: 'Blue',
        inStock: true,
        rating: 5,
        reviewCount: 8,
    },
    {
        id: 3,
        category: 'Panjabi',
        name: "Semi Fit Panjabi - Charcoal",
        price: 24.00,
        image: '/images/Product Card.png',
        color: 'Brown',
        inStock: true,
        rating: 4,
        reviewCount: 15,
    },
    {
        id: 4,
        category: 'Panjabi',
        name: "Embro Semi Fit Panjabi",
        price: 24.00,
        image: '/images/Product Card.png',
        color: 'Black',
        inStock: true,
        rating: 4,
        reviewCount: 6,
    },
    {
        id: 5,
        category: 'Panjabi',
        name: "Semi Fit Panjabi - Charcoal",
        price: 24.00,
        image: '/images/Product Card.png',
        color: 'Brown',
        inStock: false,
        rating: 3,
        reviewCount: 4,
    },
    {
        id: 6,
        category: 'Footwear',
        name: "Men's Casual Shoe",
        price: 24.00,
        image: '/images/Product Card (1).png',
        color: 'Brown',
        inStock: true,
        rating: 5,
        reviewCount: 22,
    },
    {
        id: 7,
        category: 'Perfume',
        name: "Haramain Attar Danah",
        price: 24.00,
        image: '/images/Product Card (2).png',
        color: 'Blue',
        inStock: true,
        rating: 4,
        reviewCount: 10,
    },
    {
        id: 8,
        category: 'Trouser',
        name: "Elite Comfort Pajama",
        price: 24.00,
        image: '/images/Product Card (1).png',
        color: 'Black',
        inStock: true,
        rating: 4,
        reviewCount: 18,
    },
    {
        id: 9,
        category: 'Perfume',
        name: "Al Haramain Hayati Gold",
        price: 24.00,
        image: '/images/Product Card (2).png',
        color: 'Orange',
        inStock: true,
        rating: 5,
        reviewCount: 14,
    },
    {
        id: 10,
        category: 'Panjabi',
        name: "Premium Cotton Panjabi - White",
        price: 32.00,
        image: '/images/Product Card.png',
        color: 'Blue',
        inStock: true,
        rating: 5,
        reviewCount: 30,
    },
    {
        id: 11,
        category: 'Footwear',
        name: "Leather Formal Shoe",
        price: 45.00,
        image: '/images/Product Card (1).png',
        color: 'Black',
        inStock: true,
        rating: 4,
        reviewCount: 16,
    },
    {
        id: 12,
        category: 'Trouser',
        name: "Slim Fit Cotton Trouser",
        price: 18.00,
        image: '/images/Product Card (1).png',
        color: 'Brown',
        inStock: true,
        rating: 3,
        reviewCount: 7,
    },
    {
        id: 13,
        category: 'Perfume',
        name: "Oud Arabian Perfume",
        price: 55.00,
        image: '/images/Product Card (2).png',
        color: 'Orange',
        inStock: false,
        rating: 5,
        reviewCount: 25,
    },
    {
        id: 14,
        category: 'Panjabi',
        name: "Festive Special Embroidered Panjabi",
        price: 38.00,
        image: '/images/Product Card.png',
        color: 'Blue',
        inStock: true,
        rating: 4,
        reviewCount: 11,
    },
    {
        id: 15,
        category: 'Footwear',
        name: "Casual Slip-On Loafer",
        price: 28.00,
        image: '/images/Product Card (1).png',
        color: 'Brown',
        inStock: true,
        rating: 4,
        reviewCount: 9,
    },
];
