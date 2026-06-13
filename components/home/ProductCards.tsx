import Image from 'next/image';

const products = [
    {
        id: 1,
        category: 'Footwear',
        name: 'Apex Men\'s Back Strong and perfect Belt Sandal',
        price: '$24.00',
        image: '/images/Product Card.png',
    },
    {
        id: 2,
        category: 'Trouser',
        name: 'White Cotton Slim-Fitted pant Pajama',
        price: '$24.00',
        image: '/images/Product Card (1).png',
    },
    {
        id: 3,
        category: 'Perfume',
        name: 'Haramain White Neroli Concentrated Perfume Oil',
        price: '$24.00',
        image: '/images/Product Card (2).png',
    },
];

export function ProductCards() {
    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="relative w-full h-[280px] lg:h-[320px] bg-surface-secondary rounded-lg overflow-hidden mb-3">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-[11px] text-text-muted uppercase tracking-wider">
                                {product.category}
                            </span>
                            <h3 className="text-[13px] font-medium text-text-primary mt-1 leading-snug line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-[13px] font-semibold text-text-primary mt-1">
                                {product.price}
                            </p>
                            <button className="mt-3 border border-text-primary text-text-primary px-6 py-2.5 text-[12px] font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md">
                                Add To Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
