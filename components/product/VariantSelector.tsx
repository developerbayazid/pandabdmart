'use client';

import type { ProductAttribute, ProductVariant } from '@/types/product';

type VariantSelectorProps = {
    attributes: ProductAttribute[];
    variants: ProductVariant[];
    selectedAttributes: Record<string, string>;
    onAttributeChange: (attributeId: string, valueId: string) => void;
};

export function VariantSelector({
    attributes,
    selectedAttributes,
    onAttributeChange,
}: VariantSelectorProps) {
    if (attributes.length === 0) return null;

    return (
        <div className="space-y-4">
            {attributes.map((attr) => (
                <div key={attr.id}>
                    <span className="text-[13px] font-medium text-text-primary block mb-2">
                        Select {attr.name}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {attr.values.map((value) => {
                            const isSelected = selectedAttributes[attr.id] === value.id;
                            return (
                                <button
                                    key={value.id}
                                    onClick={() => onAttributeChange(attr.id, value.id)}
                                    className={`min-w-[48px] h-10 px-3 text-[13px] font-medium rounded-md border transition-colors ${
                                        isSelected
                                            ? 'bg-surface-inverse text-text-inverse border-surface-inverse'
                                            : 'bg-surface text-text-primary border-border hover:border-border-strong'
                                    }`}
                                >
                                    {value.value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
