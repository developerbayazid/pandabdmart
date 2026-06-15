'use client';

import type { ProductReview } from '@/types/product';

type ReviewSummaryProps = {
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];
};

export function ReviewSummary({ rating, reviewCount, reviews }: ReviewSummaryProps) {
    if (reviewCount === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-[14px] text-text-secondary">No reviews yet. Be the first to review this product.</p>
            </div>
        );
    }

    const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percentage = Math.round((count / reviewCount) * 100);
        return { star, count, percentage };
    });

    return (
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="text-center sm:w-[140px] shrink-0">
                <div className="text-[40px] lg:text-[48px] font-semibold text-text-primary leading-none">
                    {rating}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`text-[14px] ${
                                star <= Math.round(rating)
                                    ? 'text-text-primary'
                                    : 'text-border'
                            }`}
                        >
                            &#9733;
                        </span>
                    ))}
                </div>
                <p className="text-[12px] text-text-muted mt-1">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
            </div>

            <div className="flex-1 space-y-1.5">
                {distribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2">
                        <span className="text-[12px] text-text-secondary w-12">
                            {star} star{star > 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-text-primary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="text-[12px] text-text-muted w-6 text-right">
                            {count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
