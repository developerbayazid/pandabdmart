'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from '@/types/admin-settings';

type HeroSectionProps = {
    slides: HeroSlide[];
    ctaText: string;
    ctaLink: string;
};

export function HeroSection({ slides, ctaText, ctaLink }: HeroSectionProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    const goToSlide = useCallback((index: number, dir: 'next' | 'prev') => {
        setDirection(dir);
        setCurrentSlide(index);
    }, []);

    const nextSlide = useCallback(() => {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next, 'next');
    }, [currentSlide, goToSlide, slides.length]);

    const prevSlide = useCallback(() => {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev, 'prev');
    }, [currentSlide, goToSlide, slides.length]);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="relative bg-background overflow-hidden">
            <button
                onClick={prevSlide}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-surface border border-border rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors shadow-sm"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-surface border border-border rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors shadow-sm"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="relative flex items-center min-h-[500px] lg:min-h-[580px]">
                    <div className="relative w-full h-full flex items-center">
                        {slides.map((slide, index) => {
                            const isActive = index === currentSlide;
                            const wasActive =
                                direction === 'next'
                                    ? index === (currentSlide - 1 + slides.length) % slides.length
                                    : index === (currentSlide + 1) % slides.length;

                            return (
                                <div
                                    key={index}
                                    className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${
                                        isActive
                                            ? 'opacity-100 translate-x-0 z-10'
                                            : wasActive
                                                ? direction === 'next'
                                                    ? 'opacity-0 -translate-x-12 z-0'
                                                    : 'opacity-0 translate-x-12 z-0'
                                                : 'opacity-0 translate-x-0 z-0 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row items-center w-full gap-8 lg:gap-12">
                                        <div className="flex-1 max-w-xl">
                                            <h1 className="font-[family-name:var(--font-serif)] text-[40px] lg:text-[52px] font-normal leading-[1.2] text-text-primary mb-4">
                                                {slide.title}
                                            </h1>
                                            <p className="text-text-secondary text-sm mb-8">
                                                &ldquo;{slide.subtitle}&rdquo;
                                            </p>
                                            <Link
                                                href={ctaLink}
                                                className="inline-block border border-text-primary text-text-primary px-6 py-3 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md"
                                            >
                                                {ctaText}
                                            </Link>
                                        </div>

                                        <div className="flex-1 relative flex justify-center items-center">
                                            <div className="relative w-[320px] h-[420px] lg:w-[380px] lg:h-[480px]">
                                                <div className="absolute inset-0 bg-surface-tertiary rounded-[50%] scale-x-90" />
                                                <Image
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    fill
                                                    className="object-contain relative z-10"
                                                    priority={index === 0}
                                                />
                                                <div className="absolute top-8 right-0 lg:right-4 z-20 bg-surface border border-border px-3 py-1.5 text-sm font-medium text-text-primary">
                                                    {slide.price}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-center gap-2 pb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentSlide ? 'bg-text-primary' : 'bg-border-strong'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
