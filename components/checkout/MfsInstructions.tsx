'use client';

import { PaymentMethod } from '@/types/checkout';

type Props = {
    method: PaymentMethod;
    txnId: string;
    paymentNumber: string;
    onTxnIdChange: (value: string) => void;
    onPaymentNumberChange: (value: string) => void;
};

export function MfsInstructions({
    method,
    txnId,
    paymentNumber,
    onTxnIdChange,
    onPaymentNumberChange,
}: Props) {
    const merchantNumber =
        method === 'bkash'
            ? process.env.NEXT_PUBLIC_BKASH_MERCHANT_NUMBER ?? '01XXXXXXXXX'
            : process.env.NEXT_PUBLIC_NAGAD_MERCHANT_NUMBER ?? '01XXXXXXXXX';

    const methodName = method === 'bkash' ? 'bKash' : 'Nagad';

    return (
        <div className="bg-surface-secondary border border-border rounded-xl p-4 space-y-4">
            <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">
                    {methodName} Payment Instructions
                </h3>
                <ol className="text-sm text-text-secondary space-y-1.5 list-decimal list-inside">
                    <li>
                        Send money to <strong className="text-text-primary">{merchantNumber}</strong>
                    </li>
                    <li>Enter the exact total amount shown above</li>
                    <li>Use your Order ID as reference (if available)</li>
                    <li>Enter the Transaction ID and your payment number below</li>
                </ol>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                        Transaction ID (TxnID)
                    </label>
                    <input
                        type="text"
                        placeholder="Enter TxnID"
                        value={txnId}
                        onChange={(e) => onTxnIdChange(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                        {methodName} Number
                    </label>
                    <input
                        type="tel"
                        placeholder="Enter your payment number"
                        value={paymentNumber}
                        onChange={(e) => onPaymentNumberChange(e.target.value)}
                        className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                    />
                </div>
            </div>
        </div>
    );
}
