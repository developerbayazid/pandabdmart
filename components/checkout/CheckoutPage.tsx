'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CartItem } from '@/types/cart';
import {
    ShippingFormData,
    PaymentMethod,
    ShippingZone,
    CheckoutSummary,
} from '@/types/checkout';
import { useToast } from '@/components/ui/toast';
import { ShippingForm } from './ShippingForm';
import { ShippingZoneSelector } from './ShippingZoneSelector';
import { CheckoutOrderSummary } from './OrderSummary';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { MfsInstructions } from './MfsInstructions';
import { validateCouponAction } from '@/actions/cart.actions';
import { placeOrderAction } from '@/actions/checkout.actions';

type Props = {
    initialItems: CartItem[];
    zones: ShippingZone[];
    userEmail?: string;
};

function calculateSummary(
    items: CartItem[],
    shippingCost: number,
    discount: number,
    taxRate: number,
): CheckoutSummary {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const tax = Math.round(subtotal * taxRate);
    const total = Math.max(0, subtotal + shippingCost + tax - discount);

    return {
        subtotal,
        shipping: shippingCost,
        discount,
        tax,
        total,
        itemCount,
    };
}

export function CheckoutPage({ initialItems, zones, userEmail }: Props) {
    const router = useRouter();
    const { showToast } = useToast();

    const [items, setItems] = useState<CartItem[]>(initialItems);
    const [shipping, setShipping] = useState<ShippingFormData>({
        firstName: '',
        lastName: '',
        email: userEmail ?? '',
        phone: '',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        country: 'Bangladesh',
        addressLabel: null,
        saveInfo: false,
    });
    const [zoneId, setZoneId] = useState<string | null>(zones[0]?.id ?? null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
    const [txnId, setTxnId] = useState('');
    const [paymentNumber, setPaymentNumber] = useState('');
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isPlacing, setIsPlacing] = useState(false);

    const selectedZone = zones.find((z) => z.id === zoneId);
    const shippingCost = selectedZone?.cost ?? 0;

    const summary = useMemo(
        () => calculateSummary(items, shippingCost, discount, 0),
        [items, shippingCost, discount],
    );

    const handleQuantityChange = (variantId: string, quantity: number) => {
        if (quantity < 1) return;
        const item = items.find((i) => i.variantId === variantId);
        if (!item || quantity > item.stock) return;
        setItems((prev) =>
            prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        );
    };

    const handleRemove = (variantId: string) => {
        setItems((prev) => prev.filter((i) => i.variantId !== variantId));
    };

    const handleCouponApply = async (code: string) => {
        const result = await validateCouponAction(code, summary.subtotal);
        if (result.success && result.data) {
            setCouponCode(result.data.code);
            setDiscount(result.data.discount);
            showToast(`Coupon "${result.data.code}" applied — ${result.data.discount} off`, 'success');
        } else {
            showToast(result.error ?? 'Failed to apply coupon', 'error');
        }
    };

    const validate = (): string | null => {
        if (!shipping.firstName.trim()) return 'Please enter your first name.';
        if (!shipping.lastName.trim()) return 'Please enter your last name.';
        if (!shipping.email.trim()) return 'Please enter your email address.';
        if (!shipping.phone.trim()) return 'Please enter your phone number.';
        if (!shipping.country.trim()) return 'Please select your country.';
        if (!shipping.city.trim()) return 'Please enter your city.';
        if (!shipping.district.trim()) return 'Please enter your district.';
        if (!shipping.postalCode.trim()) return 'Please enter your postal code.';
        if (!shipping.address.trim()) return 'Please enter your delivery address.';
        if (!zoneId) return 'Please select a shipping method.';
        if (items.length === 0) return 'Your cart is empty.';
        if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
            if (!txnId.trim()) return 'Please enter your Transaction ID.';
            if (!paymentNumber.trim()) return 'Please enter your payment number.';
        }
        if (!agreeToTerms) return 'Please agree to the terms and conditions.';
        return null;
    };

    const handlePlaceOrder = async () => {
        const error = validate();
        if (error) {
            showToast(error, 'error');
            return;
        }

        setIsPlacing(true);

        const result = await placeOrderAction({
            cartItems: items.map((item) => ({
                id: item.id,
                variantId: item.variantId,
                productId: item.productId,
                quantity: item.quantity,
            })),
            shippingAddress: {
                fullName: `${shipping.firstName} ${shipping.lastName}`.trim(),
                phone: shipping.phone,
                address: shipping.address,
                city: shipping.city,
                district: shipping.district,
                postalCode: shipping.postalCode,
            },
            shippingCost,
            discountTotal: discount,
            couponCode,
            paymentMethod,
            txnId: txnId || null,
            paymentNumber: paymentNumber || null,
        });

        if (result.success) {
            if (result.gatewayUrl) {
                router.push(result.gatewayUrl);
            } else if (result.orderId) {
                router.push(`/track/${result.orderId}`);
            }
            return;
        }

        showToast(result.error ?? 'Failed to place order. Please try again.', 'error');
        setIsPlacing(false);
    };

    if (items.length === 0) {
        return (
            <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
                <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                    <Link href="/" className="hover:text-text-primary transition-colors">
                        Home
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-text-primary font-medium">Checkout</span>
                </nav>

                <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-8">
                    Checkout
                </h1>

                <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                    <p className="text-[14px] text-text-secondary mb-4">
                        Your cart is empty.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block bg-surface border border-border text-text-primary px-6 py-2.5 text-[13px] font-medium rounded-md hover:bg-surface-secondary"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-8 lg:px-16 py-8">
            <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                <Link href="/" className="hover:text-text-primary transition-colors">
                    Home
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-text-primary font-medium">Checkout</span>
            </nav>

            <h1 className="font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary mb-8">
                Checkout
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column — Billing + Shipping */}
                <div className="flex-1 min-w-0 space-y-8">
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <ShippingForm value={shipping} onChange={setShipping} />
                    </div>

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <ShippingZoneSelector
                            zones={zones}
                            selectedId={zoneId}
                            onChange={setZoneId}
                        />
                    </div>
                </div>

                {/* Right Column — Order Summary + Payment */}
                <div className="w-full lg:w-[420px] shrink-0 space-y-6">
                    <CheckoutOrderSummary
                        items={items}
                        summary={summary}
                        couponCode={couponCode}
                        discount={discount}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                        onCouponApply={handleCouponApply}
                    />

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <PaymentMethodSelector
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                        />
                    </div>

                    {paymentMethod === 'bkash' || paymentMethod === 'nagad' ? (
                        <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                            <MfsInstructions
                                method={paymentMethod}
                                txnId={txnId}
                                paymentNumber={paymentNumber}
                                onTxnIdChange={setTxnId}
                                onPaymentNumberChange={setPaymentNumber}
                            />
                        </div>
                    ) : null}

                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary"
                            />
                            <span className="text-sm text-text-secondary">
                                I have read and agree to the{' '}
                                <Link href="/terms" className="text-text-primary underline underline-offset-2 hover:text-text-secondary">
                                    terms and conditions
                                </Link>
                            </span>
                        </label>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacing}
                            className="block w-full mt-6 bg-surface-inverse text-text-inverse text-center rounded-md px-4 py-3 text-[14px] font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors"
                        >
                            {isPlacing ? 'Placing Order...' : 'Place Order'}
                        </button>

                        <Link
                            href="/cart"
                            className="block w-full text-center mt-3 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Back to Cart
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
