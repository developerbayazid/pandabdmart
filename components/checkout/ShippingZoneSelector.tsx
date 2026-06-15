'use client';

import { ShippingZone } from '@/types/checkout';
import { formatCurrency } from '@/lib/utils';

type Props = {
    zones: ShippingZone[];
    selectedId: string | null;
    onChange: (zoneId: string) => void;
};

export function ShippingZoneSelector({ zones, selectedId, onChange }: Props) {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-text-primary leading-6">
                Shipping method
            </h2>

            <div className="space-y-3">
                {zones.map((zone) => (
                    <label
                        key={zone.id}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                            selectedId === zone.id
                                ? 'border-text-primary bg-surface-secondary'
                                : 'border-border hover:border-border-strong'
                        }`}
                    >
                        <input
                            type="radio"
                            name="shipping-zone"
                            value={zone.id}
                            checked={selectedId === zone.id}
                            onChange={() => onChange(zone.id)}
                            className="mt-0.5 w-4 h-4 text-text-primary border-border focus:ring-text-primary"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                                {zone.name}
                            </p>
                            {zone.description && (
                                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                    {zone.description}
                                </p>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                            {formatCurrency(zone.cost)}
                        </span>
                    </label>
                ))}

                {zones.length === 0 && (
                    <p className="text-sm text-text-muted">
                        No shipping zones available.
                    </p>
                )}
            </div>
        </div>
    );
}
