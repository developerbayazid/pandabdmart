'use client';

import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

export function ShopBanner() {
    return (
        <div className="bg-surface-secondary rounded-2xl overflow-hidden mb-8">
            <div className="flex items-center">
                <div className="flex-1 p-8 lg:p-12">
                    <span className="text-[12px] text-text-secondary uppercase tracking-wider font-medium">
                        Festive Special:
                    </span>
                    <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary mt-2">
                        Flat 30% Off on All
                        <br />
                        Panjabis
                    </h2>
                    <button className="mt-4 text-[13px] text-text-primary underline underline-offset-4 font-medium hover:text-text-secondary transition-colors">
                        Shop Now
                    </button>
                </div>
                <div className="hidden lg:block relative w-[400px] h-[280px] shrink-0">
                    <Image
                        src="/images/Hero Image.png"
                        alt="Festive Special Panjabi"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
