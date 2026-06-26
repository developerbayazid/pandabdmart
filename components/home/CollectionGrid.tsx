import Image from 'next/image';
import Link from 'next/link';
import type { CollectionGridItem } from '@/types/admin-settings';

type CollectionGridProps = {
    items: CollectionGridItem[];
};

export function CollectionGrid({ items }: CollectionGridProps) {
    if (items.length < 5) return null;

    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {items.map((item, i) => {
                        const isTall = i === 0;
                        const imageEl = (
                            <div className={`relative ${isTall ? 'h-[400px] lg:h-[600px]' : 'h-[190px] lg:h-[290px]'} rounded-lg overflow-hidden`}>
                                <Image
                                    src={item.image}
                                    alt={`Collection ${i + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        );

                        if (item.link) {
                            return (
                                <Link key={i} href={item.link} className={`${isTall ? 'row-span-2' : ''} block group`}>
                                    {imageEl}
                                </Link>
                            );
                        }
                        return <div key={i} className={`${isTall ? 'row-span-2' : ''} group`}>{imageEl}</div>;
                    })}
                </div>
            </div>
        </section>
    );
}
