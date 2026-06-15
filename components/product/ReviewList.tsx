'use client';

import type { ProductReview } from '@/types/product';

type ReviewListProps = {
    reviews: ProductReview[];
};

export function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}

function ReviewCard({ review }: { review: ProductReview }) {
    const date = new Date(review.createdAt).toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text-primary">
                        {review.userName}
                    </span>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`text-[12px] ${
                                    star <= review.rating
                                        ? 'text-text-primary'
                                        : 'text-border'
                                }`}
                            >
                                &#9733;
                            </span>
                        ))}
                    </div>
                </div>
                <span className="text-[12px] text-text-muted">{date}</span>
            </div>
            <p className="text-[14px] text-text-secondary leading-relaxed">
                {review.comment}
            </p>
        </div>
    );
}
