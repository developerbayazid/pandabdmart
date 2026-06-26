import Image from 'next/image';
import Link from 'next/link';

type FestiveBannerProps = {
    eyebrow?: string;
    title?: string;
    ctaText?: string;
    ctaLink?: string;
    image?: string;
};

export function FestiveBanner({ eyebrow, title, ctaText, ctaLink, image }: FestiveBannerProps) {
    return (
        <section className="bg-background py-8 lg:py-12">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="bg-surface-secondary rounded-2xl overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="flex-1 p-8 lg:p-12 lg:pl-16">
                            {eyebrow && (
                                <span className="text-[12px] text-text-secondary uppercase tracking-wider font-medium mb-2 block">
                                    {eyebrow}
                                </span>
                            )}
                            {title && (
                                <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary mb-6">
                                    {title}
                                </h2>
                            )}
                            {ctaText && ctaLink && (
                                <Link
                                    href={ctaLink}
                                    className="text-[13px] text-text-primary underline underline-offset-4 font-medium hover:text-text-secondary transition-colors"
                                >
                                    {ctaText}
                                </Link>
                            )}
                        </div>

                        {image && (
                            <div className="flex-1 relative w-full h-[300px] lg:h-[360px]">
                                <Image
                                    src={image}
                                    alt={title ?? 'Festive Banner'}
                                    fill
                                    className="object-contain object-center lg:object-right"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
