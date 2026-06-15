'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { guestLookupAction } from '@/actions/order.actions';
import type { Order } from '@/types/order';
import { Search } from 'lucide-react';

type GuestOrderLookupProps = {
    onOrderFound: (order: Order) => void;
};

export function GuestOrderLookup({ onOrderFound }: GuestOrderLookupProps) {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!orderId.trim()) {
            setError('Please enter your Order ID');
            return;
        }

        if (!email.trim() && !phone.trim()) {
            setError('Please enter either your email or phone number');
            return;
        }

        setLoading(true);
        const result = await guestLookupAction({
            orderId: orderId.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
        });

        if (result.success && result.order) {
            onOrderFound(result.order);
        } else {
            setError(result.error ?? 'Order not found');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                <h2 className="text-base font-semibold text-text-primary leading-6 mb-1">
                    Track Your Order
                </h2>
                <p className="text-sm text-text-secondary mb-6">
                    Enter your Order ID and email or phone number to view your
                    order status.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Order ID
                        </label>
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Enter your order ID"
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email used for this order"
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-surface px-2 text-text-muted">or</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone number used at checkout"
                            className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-error bg-error-light px-3 py-2 rounded-md">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        <Search className="w-4 h-4" />
                        {loading ? 'Searching...' : 'Track Order'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
