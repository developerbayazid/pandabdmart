import Image from 'next/image';

const featuredProduct = {
    category: 'Panjabi',
    name: 'Taxer Printed and Embroidered Endi Silk Panjabi',
    price: '$59.00',
    description:
        'Experience the perfect blend of tradition and sophistication with our Taxer Printed and Embroidered Endi Silk Panjabi — crafted for elegance and comfort.',
    image: '/images/Featured Product Image.png',
    thumbnails: [
        '/images/Featured Product Image (1).png',
        '/images/Featured Product Image (2).png',
    ],
};

export function FeaturedProduct() {
    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Left: Image (as shown in design) */}
                    <div className="flex-1 relative w-full max-w-[480px] h-[480px] lg:h-[560px]">
                        <Image
                            src={featuredProduct.image}
                            alt={featuredProduct.name}
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Right: Text content */}
                    <div className="flex-1 max-w-md">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-text-secondary text-sm font-medium">{featuredProduct.category}</span>
                            <span className="w-8 h-px bg-text-secondary" />
                        </div>
                        <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary mb-4">
                            {featuredProduct.name}
                        </h2>
                        <p className="text-[24px] font-semibold text-text-primary mb-3">
                            {featuredProduct.price}
                        </p>
                        <p className="text-text-secondary text-sm leading-relaxed mb-6">
                            {featuredProduct.description}
                        </p>
                        <div className="flex gap-3 mb-6">
                            {featuredProduct.thumbnails.map((thumb, index) => (
                                <div
                                    key={index}
                                    className="w-16 h-16 border border-border rounded-md overflow-hidden bg-surface-secondary"
                                >
                                    <Image
                                        src={thumb}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                        <button className="border border-text-primary text-text-primary px-6 py-2.5 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md">
                            Add To Cart
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
