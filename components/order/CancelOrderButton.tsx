'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cancelOrderAction } from '@/actions/order.actions';
import { XCircle } from 'lucide-react';

type CancelOrderButtonProps = {
    orderId: string;
    canCancel: boolean;
};

export function CancelOrderButton({
    orderId,
    canCancel,
}: CancelOrderButtonProps) {
    const [loading, setLoading] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!canCancel || cancelled) {
        return null;
    }

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setLoading(true);
        setError(null);

        const result = await cancelOrderAction(orderId);

        if (result.success) {
            setCancelled(true);
        } else {
            setError(result.error ?? 'Failed to cancel order');
        }

        setLoading(false);
    };

    return (
        <div>
            <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
            >
                <XCircle className="w-4 h-4" />
                {loading ? 'Cancelling...' : 'Cancel Order'}
            </Button>
            {error && (
                <p className="text-xs text-error mt-2">{error}</p>
            )}
        </div>
    );
}
