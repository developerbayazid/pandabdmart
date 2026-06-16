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

export type UserReview = {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    rating: number;
    comment: string;
    createdAt: string;
};

export async function getUserReviews(userId: string): Promise<UserReview[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            product_id,
            product:products!inner(
                name,
                slug
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch reviews.');

    return (data ?? []).map((row) => {
        const product = row.product as unknown as { name: string; slug: string };
        return {
            id: row.id,
            productId: row.product_id,
            productName: product.name,
            productSlug: product.slug,
            rating: row.rating,
            comment: row.comment ?? '',
            createdAt: row.created_at,
        };
    });
}

export async function updateReview(reviewId: string, userId: string, input: { rating: number; comment: string }): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('reviews')
        .update({ rating: input.rating, comment: input.comment })
        .eq('id', reviewId)
        .eq('user_id', userId);

    if (error) throw new Error('Failed to update review.');
}

export async function deleteReview(reviewId: string, userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId);

    if (error) throw new Error('Failed to delete review.');
}
