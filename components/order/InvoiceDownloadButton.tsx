'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { downloadInvoiceAction } from '@/actions/order.actions';
import { Download } from 'lucide-react';

type InvoiceDownloadButtonProps = {
    orderId: string;
};

export function InvoiceDownloadButton({
    orderId,
}: InvoiceDownloadButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        const result = await downloadInvoiceAction(orderId);

        if (result.success && result.buffer) {
            const blob = new Blob([result.buffer as unknown as BlobPart], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${orderId.slice(0, 8)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            setError(result.error ?? 'Failed to download invoice');
        }

        setLoading(false);
    };

    return (
        <div>
            <Button variant="secondary" onClick={handleDownload} disabled={loading}>
                <Download className="w-4 h-4" />
                {loading ? 'Generating...' : 'Download Invoice'}
            </Button>
            {error && (
                <p className="text-xs text-error mt-2">{error}</p>
            )}
        </div>
    );
}
