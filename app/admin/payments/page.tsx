import { Suspense } from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getPayments } from '@/services/payment.service';
import { PaymentQueue } from '@/components/admin/PaymentQueue';
import { PageSpinner } from '@/components/ui/PageSpinner';

export default function AdminPaymentsPage() {
    return (
        <Suspense fallback={<PageSpinner />}>
            <PaymentsContent />
        </Suspense>
    );
}

async function PaymentsContent() {
    await requireRole('admin', 'shop_manager');

    const result = await getPayments();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-[16px] font-semibold text-text-primary">Payments</h1>
                <p className="text-[14px] text-text-secondary mt-1">
                    All payment records
                </p>
            </div>

            <PaymentQueue
                initialPayments={result.success && result.data ? result.data : []}
            />
        </div>
    );
}
