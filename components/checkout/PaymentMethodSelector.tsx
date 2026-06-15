'use client';

import { PaymentMethod } from '@/types/checkout';

type Props = {
    value: PaymentMethod;
    onChange: (method: PaymentMethod) => void;
};

export function PaymentMethodSelector({ value, onChange }: Props) {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <label
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                        value === 'cash_on_delivery'
                            ? 'border-text-primary bg-surface-secondary'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <input
                        type="radio"
                        name="payment-method"
                        value="cash_on_delivery"
                        checked={value === 'cash_on_delivery'}
                        onChange={() => onChange('cash_on_delivery')}
                        className="w-4 h-4 text-text-primary border-border focus:ring-text-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                        Cash on delivery
                    </span>
                </label>

                <label
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                        value === 'bkash'
                            ? 'border-text-primary bg-surface-secondary'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <input
                        type="radio"
                        name="payment-method"
                        value="bkash"
                        checked={value === 'bkash'}
                        onChange={() => onChange('bkash')}
                        className="w-4 h-4 text-text-primary border-border focus:ring-text-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                        bKash
                    </span>
                </label>

                <label
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                        value === 'nagad'
                            ? 'border-text-primary bg-surface-secondary'
                            : 'border-border hover:border-border-strong'
                    }`}
                >
                    <input
                        type="radio"
                        name="payment-method"
                        value="nagad"
                        checked={value === 'nagad'}
                        onChange={() => onChange('nagad')}
                        className="w-4 h-4 text-text-primary border-border focus:ring-text-primary"
                    />
                    <span className="text-sm font-medium text-text-primary">
                        Nagad
                    </span>
                </label>
            </div>
        </div>
    );
}
