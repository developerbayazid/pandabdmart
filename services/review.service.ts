import { createReview, findExistingReview, type CreateReviewInput } from '@/repositories/review.repository';

export type SubmitReviewInput = {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
};

export type SubmitReviewResult = {
    success: boolean;
    error?: string;
};

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
    if (!input.rating || input.rating < 1 || input.rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5.' };
    }

    const trimmedComment = input.comment.trim();
    if (!trimmedComment) {
        return { success: false, error: 'Please write a review comment.' };
    }

    if (trimmedComment.length < 10) {
        return { success: false, error: 'Review must be at least 10 characters.' };
    }

    const alreadyReviewed = await findExistingReview(input.productId, input.userId);
    if (alreadyReviewed) {
        return { success: false, error: 'You have already reviewed this product.' };
    }

    const reviewInput: CreateReviewInput = {
        productId: input.productId,
        userId: input.userId,
        rating: input.rating,
        comment: trimmedComment,
    };

    try {
        await createReview(reviewInput);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit review.',
        };
    }
}
