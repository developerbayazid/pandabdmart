import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-user';
import { redirect } from 'next/navigation';
import { PageSpinner } from '@/components/ui/PageSpinner';
import { ReviewsContent } from '@/components/dashboard/ReviewsContent';
import type { UserReview } from '@/repositories/review.repository';

export default function ReviewsPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <ReviewsContentAsync />
        </Suspense>
    );
}

async function ReviewsContentAsync() {
    const user = await getUser();
    if (!user) redirect('/signin');

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div>
                <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary mb-6">
                    My Reviews
                </h2>
                <div className="bg-error-light text-error-foreground text-sm p-4 rounded-md">
                    Failed to load reviews: {error.message}
                </div>
            </div>
        );
    }

    const reviews: UserReview[] = (data ?? []).map((row) => {
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

    return <ReviewsContent reviews={reviews} />;
}
