import { createClient } from '@/lib/supabase/server';

export type CreateReviewInput = {
    productId: string;
    userId: string;
    rating: number;
    comment: string;
};

export type ReviewResult = {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
};

export async function createReview(input: CreateReviewInput): Promise<ReviewResult> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            product_id: input.productId,
            user_id: input.userId,
            rating: input.rating,
            comment: input.comment,
        })
        .select('id, rating, comment, created_at')
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('You have already reviewed this product.');
        }
        throw new Error('Failed to submit review. Please try again.');
    }

    return {
        id: data.id,
        rating: data.rating,
        comment: data.comment ?? '',
        createdAt: data.created_at,
    };
}

export async function findExistingReview(productId: string, userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('user_id', userId);

    if (error) return false;
    return (count ?? 0) > 0;
}
