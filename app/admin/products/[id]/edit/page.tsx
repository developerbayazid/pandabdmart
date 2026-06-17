import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProductFormData } from '@/services/product.service';
import { ProductForm } from '@/components/admin/ProductForm';
import { requireRole } from '@/lib/auth/require-role';
import { PageSpinner } from '@/components/ui/PageSpinner';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default function EditProductPage({ params }: PageProps) {
    return (
        <Suspense fallback={<PageSpinner />}>
            <EditProductContent params={params} />
        </Suspense>
    );
}

async function EditProductContent({ params }: { params: Promise<{ id: string }> }) {
    await requireRole('admin', 'shop_manager');

    const { id } = await params;

    const result = await getProductFormData(id);

    if (!result.success || !result.data) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                <p className="text-[14px] text-text-secondary">
                    {result.error || 'Failed to load product data'}
                </p>
            </div>
        );
    }

    if (!result.data.product) {
        notFound();
    }

    const product = result.data.product;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">
                    Edit Product
                </h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    {(product.name as string) ?? 'Untitled'}
                </p>
            </div>

            <ProductForm
                initialProduct={result.data.product}
                options={result.data.options}
                mode="edit"
                productId={id}
            />
        </div>
    );
}
