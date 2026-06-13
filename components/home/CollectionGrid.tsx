import Image from 'next/image';

const collectionImages = [
    { id: 1, src: '/images/image.png', alt: 'Collection 1' },
    { id: 2, src: '/images/image (1).png', alt: 'Collection 2' },
    { id: 3, src: '/images/image (2).png', alt: 'Collection 3' },
    { id: 4, src: '/images/image (3).png', alt: 'Collection 4' },
    { id: 5, src: '/images/image (4).png', alt: 'Collection 5' },
];

export function CollectionGrid() {
    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {/* Left tall image - spans 2 rows */}
                    <div className="row-span-2 relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden">
                        <Image
                            src={collectionImages[0].src}
                            alt={collectionImages[0].alt}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Top right - 2 images */}
                    <div className="relative h-[190px] lg:h-[290px] rounded-lg overflow-hidden">
                        <Image
                            src={collectionImages[1].src}
                            alt={collectionImages[1].alt}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="relative h-[190px] lg:h-[290px] rounded-lg overflow-hidden">
                        <Image
                            src={collectionImages[2].src}
                            alt={collectionImages[2].alt}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Bottom right - 2 images */}
                    <div className="relative h-[190px] lg:h-[290px] rounded-lg overflow-hidden">
                        <Image
                            src={collectionImages[3].src}
                            alt={collectionImages[3].alt}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="relative h-[190px] lg:h-[290px] rounded-lg overflow-hidden">
                        <Image
                            src={collectionImages[4].src}
                            alt={collectionImages[4].alt}
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
