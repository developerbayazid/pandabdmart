'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { updateReviewAction, deleteReviewAction } from '@/actions/review.actions';
import type { UserReview } from '@/repositories/review.repository';
import { Star, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

type ReviewsContentProps = {
    reviews: UserReview[];
};

export function ReviewsContent({ reviews }: ReviewsContentProps) {
    return (
        <div>
            <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                My Reviews
            </h2>

            {reviews.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-sm text-text-secondary mb-4">
                        You haven&apos;t written any reviews yet.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 border border-text-primary text-text-primary px-5 py-2 text-[13px] font-medium rounded-md hover:bg-surface-inverse hover:text-text-inverse transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewCard({ review }: { review: UserReview }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteReviewAction(review.id);
        setIsDeleting(false);
    };

    if (isEditing) {
        return (
            <EditReviewForm
                review={review}
                onCancel={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <div>
                        <Link
                            href={`/products/${review.productSlug}`}
                            className="text-sm font-semibold text-text-primary hover:text-text-secondary transition-colors"
                        >
                            {review.productName}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                    i < review.rating
                                        ? 'fill-text-primary text-text-primary'
                                        : 'text-border'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-secondary transition-colors"
                        aria-label="Edit review"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-text-muted hover:text-error rounded-md hover:bg-error-light transition-colors disabled:opacity-50"
                        aria-label="Delete review"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditReviewForm({
    review,
    onCancel,
}: {
    review: UserReview;
    onCancel: () => void;
}) {
    const [rating, setRating] = useState(review.rating);
    const [state, formAction, pending] = useActionState(
        (_prev: { success: boolean; error?: string } | null, fd: FormData) => {
            fd.set('rating', String(rating));
            return updateReviewAction(review.id, null, fd);
        },
        null,
    );

    return (
        <div className="bg-surface border border-border rounded-2xl p-4">
            <form action={formAction} className="space-y-3">
                {state?.error && (
                    <div className="bg-error-light text-error-foreground text-xs p-2 rounded-md">
                        {state.error}
                    </div>
                )}
                <div>
                    <span className="text-sm font-semibold text-text-primary">{review.productName}</span>
                </div>
                <div>
                    <label className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Rating
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="cursor-pointer"
                            >
                                <Star
                                    className={`w-5 h-5 ${
                                        star <= rating
                                            ? 'fill-text-primary text-text-primary'
                                            : 'text-border'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor={`edit-comment-${review.id}`} className="block text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Review
                    </label>
                    <textarea
                        id={`edit-comment-${review.id}`}
                        name="comment"
                        defaultValue={review.comment}
                        placeholder="Write your review..."
                        rows={3}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary resize-y"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button type="submit" size="sm" disabled={pending}>
                        <Check className="w-3.5 h-3.5" />
                        {pending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        <X className="w-3.5 h-3.5" />
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
