'use client';

type QuantitySelectorProps = {
    quantity: number;
    onChange: (quantity: number) => void;
    max?: number;
};

export function QuantitySelector({ quantity, onChange, max }: QuantitySelectorProps) {
    const decrement = () => {
        if (quantity > 1) onChange(quantity - 1);
    };

    const increment = () => {
        if (max === undefined || quantity < max) onChange(quantity + 1);
    };

    return (
        <div className="flex items-center border border-border rounded-md">
            <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
            >
                <span className="text-[16px] leading-none">&#8722;</span>
            </button>
            <span className="w-10 h-10 flex items-center justify-center text-[13px] font-medium text-text-primary border-x border-border">
                {quantity}
            </span>
            <button
                onClick={increment}
                disabled={max !== undefined && quantity >= max}
                className="w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
            >
                <span className="text-[16px] leading-none">&#43;</span>
            </button>
        </div>
    );
}
