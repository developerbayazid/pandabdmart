import Image from 'next/image';
import Link from 'next/link';

export function FestiveBanner() {
    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="bg-surface-secondary rounded-2xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center">
                        {/* Left: Text */}
                        <div className="flex-1 p-8 lg:p-12 lg:pl-16">
                            <span className="text-[12px] text-text-secondary uppercase tracking-wider font-medium mb-2 block">
                                Festive Special:
                            </span>
                            <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary mb-6">
                                Flat 30% Off on All Panjabis
                            </h2>
                            <Link
                                href="/shop"
                                className="text-[13px] text-text-primary underline underline-offset-4 font-medium hover:text-text-secondary transition-colors"
                            >
                                Shop Now
                            </Link>
                        </div>

                        {/* Right: Image */}
                        <div className="flex-1 relative w-full h-[300px] lg:h-[360px]">
                            <Image
                                src="/images/Header Product Image.png"
                                alt="Festive Panjabi"
                                fill
                                className="object-contain object-center lg:object-right"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
