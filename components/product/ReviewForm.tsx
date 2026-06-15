'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { submitReviewAction, type SubmitReviewActionState } from '@/actions/review.actions';
import Link from 'next/link';

type ReviewFormProps = {
    productSlug: string;
    productId: string;
};

export function ReviewForm({ productSlug, productId }: ReviewFormProps) {
    const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsSignedIn(!!session);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (selectedRating === 0) {
            setError('Please select a rating.');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Review must be at least 10 characters.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.set('rating', String(selectedRating));
        formData.set('comment', comment);

        const result: SubmitReviewActionState = await submitReviewAction(
            productSlug,
            productId,
            null,
            formData,
        );

        if (result.success) {
            setSuccess(true);
            setComment('');
            setSelectedRating(0);
            router.refresh();
        } else {
            setError(result.error ?? 'Failed to submit review.');
        }

        setLoading(false);
    };

    if (isSignedIn === null) {
        return (
            <div className="border border-border rounded-lg p-4">
                <div className="h-20 animate-pulse bg-surface-secondary rounded-md" />
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="border border-border rounded-lg p-4 text-center">
                <p className="text-[14px] text-text-secondary mb-2">
                    Please sign in to write a review.
                </p>
                <Link
                    href={`/signin?redirect=/products/${productSlug}`}
                    className="inline-block border border-text-primary text-text-primary px-4 py-1.5 text-[13px] font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="border border-border rounded-lg p-4 bg-success-light">
                <p className="text-[14px] text-success-foreground font-medium">
                    Thank you for your review!
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4">
            <h4 className="text-[14px] font-medium text-text-primary mb-3">Write a Review</h4>

            {error && (
                <p className="text-[13px] text-error mb-3 bg-error-light px-3 py-2 rounded-md">
                    {error}
                </p>
            )}

            <div className="mb-3">
                <label className="block text-[12px] font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                    Your Rating
                </label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            className={`text-[20px] transition-colors ${
                                star <= selectedRating
                                    ? 'text-text-primary'
                                    : 'text-border hover:text-text-primary'
                            }`}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                            &#9733;
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <label
                    htmlFor="review-comment"
                    className="block text-[12px] font-medium uppercase tracking-wide text-text-secondary mb-1.5"
                >
                    Your Review
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience with this product..."
                    className="w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-surface-inverse text-text-inverse text-[13px] font-medium px-5 py-2 rounded-md hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
