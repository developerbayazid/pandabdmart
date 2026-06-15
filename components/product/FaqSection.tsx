'use client';

import { useState } from 'react';
import type { FaqItem } from '@/types/product';

type FaqSectionProps = {
    items?: FaqItem[];
};

const defaultFaqs: FaqItem[] = [
    {
        question: 'What sizes are available?',
        answer: 'We offer sizes ranging from Small (S) to Double Extra Large (2XL). Each product has a detailed size chart to help you find the perfect fit.',
    },
    {
        question: 'Do you offer custom tailoring?',
        answer: 'Currently, we do not offer custom tailoring services. However, our products are designed with standard fits that accommodate most body types.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept SSLCommerz for card and mobile banking payments, as well as manual bKash and Nagad payments for your convenience.',
    },
    {
        question: 'How long does delivery take?',
        answer: 'Delivery within Dhaka typically takes 1-2 business days. Outside Dhaka, delivery takes 3-5 business days depending on your location.',
    },
    {
        question: 'Can I return or exchange an item?',
        answer: 'Yes, we offer returns and exchanges within 7 days of delivery, provided the item is unused and in its original packaging.',
    },
];

export function FaqSection({ items = defaultFaqs }: FaqSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section className="mt-16">
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary text-center mb-2">
                &ldquo;Frequently Asked Questions (FAQs)&rdquo;
            </h2>
            <p className="text-[13px] text-text-secondary text-center mb-8">
                &ldquo;Find answers to your questions about orders, shipping, returns, and more!&rdquo;
            </p>

            <div className="max-w-3xl mx-auto space-y-3">
                {items.map((item, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                        <div
                            key={idx}
                            className="border border-border rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-secondary transition-colors"
                            >
                                <span className="text-[14px] font-medium text-text-primary">
                                    {item.question}
                                </span>
                                <span className="text-[16px] text-text-secondary ml-4 shrink-0">
                                    {isOpen ? '\u2212' : '+'}
                                </span>
                            </button>
                            {isOpen && (
                                <div className="px-5 pb-4">
                                    <p className="text-[14px] text-text-secondary leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
