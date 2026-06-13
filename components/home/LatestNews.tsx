import Image from 'next/image';
import Link from 'next/link';

const newsItems = [
    {
        id: 1,
        title: 'How to Style a Panjabi for Any Occasion',
        image: '/images/Component 2.png',
        slug: '/blog/style-panjabi',
    },
    {
        id: 2,
        title: 'Festive & Wedding Panjabi Trends of the Year',
        image: '/images/Component 3.png',
        slug: '/blog/festive-trends',
    },
    {
        id: 3,
        title: 'Caring for Your Panjabi: Washing & Maintenance Tips',
        image: '/images/Component 5.png',
        slug: '/blog/caring-panjabi',
    },
];

export function LatestNews() {
    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="text-center mb-8">
                    <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-2">
                        Latest News
                    </h2>
                    <p className="text-text-secondary text-sm">
                        &ldquo;Style Insights: Fashion Tips & Trends&rdquo;
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {newsItems.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <div className="relative w-full h-[220px] lg:h-[260px] rounded-lg overflow-hidden mb-4">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <h3 className="text-[14px] font-medium text-text-primary leading-snug mb-2 line-clamp-2">
                                {item.title}
                            </h3>
                            <Link
                                href={item.slug}
                                className="text-[12px] text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
                            >
                                Read More
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
