'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
    {
        id: 1,
        title: 'A model wearing your best Panjabi design.',
        subtitle: 'Elevate Your Style with Our Finest Panjabi Collection.',
        image: '/images/Hero Product Image.png',
        price: '$45',
    },
    {
        id: 2,
        title: 'Traditional elegance meets modern style.',
        subtitle: 'Discover our premium collection of handcrafted panjabis.',
        image: '/images/Hero Product Image (1).png',
        price: '$52',
    },
    {
        id: 3,
        title: 'Crafted with precision and passion.',
        subtitle: 'Experience the finest fabrics and intricate designs.',
        image: '/images/Hero Product Image (2).png',
        price: '$48',
    },
];

export function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    const goToSlide = useCallback((index: number, dir: 'next' | 'prev') => {
        setDirection(dir);
        setCurrentSlide(index);
    }, []);

    const nextSlide = useCallback(() => {
        const next = (currentSlide + 1) % heroSlides.length;
        goToSlide(next, 'next');
    }, [currentSlide, goToSlide]);

    const prevSlide = useCallback(() => {
        const prev = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
        goToSlide(prev, 'prev');
    }, [currentSlide, goToSlide]);

    // Autoplay
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="relative bg-background overflow-hidden">
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16">
                <div className="relative flex items-center min-h-[500px] lg:min-h-[580px]">
                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 lg:left-8 z-20 p-2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Slides stacked with opacity transition */}
                    <div className="relative w-full h-full flex items-center">
                        {heroSlides.map((slide, index) => {
                            const isActive = index === currentSlide;
                            const wasActive =
                                direction === 'next'
                                    ? index === (currentSlide - 1 + heroSlides.length) % heroSlides.length
                                    : index === (currentSlide + 1) % heroSlides.length;

                            return (
                                <div
                                    key={slide.id}
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
                                        {/* Left: Text */}
                                        <div className="flex-1 max-w-xl">
                                            <h1 className="font-[family-name:var(--font-serif)] text-[40px] lg:text-[52px] font-normal leading-[1.2] text-text-primary mb-4">
                                                {slide.title}
                                            </h1>
                                            <p className="text-text-secondary text-sm mb-8">
                                                &ldquo;{slide.subtitle}&rdquo;
                                            </p>
                                            <Link
                                                href="/shop"
                                                className="inline-block border border-text-primary text-text-primary px-6 py-3 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md"
                                            >
                                                Shop Now
                                            </Link>
                                        </div>

                                        {/* Right: Image */}
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

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 lg:right-8 z-20 p-2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Dots */}
                <div className="flex justify-center gap-2 pb-8">
                    {heroSlides.map((_, index) => (
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
