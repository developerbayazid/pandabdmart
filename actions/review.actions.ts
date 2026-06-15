'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth/require-auth';
import { submitReview } from '@/services/review.service';

export type SubmitReviewActionState = {
    success: boolean;
    error?: string;
};

export async function submitReviewAction(
    productSlug: string,
    productId: string,
    _prevState: SubmitReviewActionState | null,
    formData: FormData,
): Promise<SubmitReviewActionState> {
    const user = await requireAuth();

    const rating = Number(formData.get('rating'));
    const comment = (formData.get('comment') as string) ?? '';

    const result = await submitReview({
        productId,
        userId: user.id,
        rating,
        comment,
    });

    if (result.success) {
        revalidatePath(`/products/${productSlug}`);
    }

    return result;
}
