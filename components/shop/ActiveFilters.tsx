'use client';

import { X } from 'lucide-react';

type ActiveFilter = {
    type: string;
    label: string;
    value: string;
};

type ActiveFiltersProps = {
    filters: ActiveFilter[];
    onRemove: (filter: ActiveFilter) => void;
    onClearAll: () => void;
};

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    if (filters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {filters.map((filter, index) => (
                <span
                    key={`${filter.type}-${filter.value}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium bg-surface-secondary text-text-secondary border border-border rounded-full"
                >
                    {filter.label}
                    <button
                        onClick={() => onRemove(filter)}
                        className="hover:text-text-primary transition-colors"
                        aria-label={`Remove ${filter.label} filter`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <button
                onClick={onClearAll}
                className="text-[12px] font-medium text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
            >
                Clear All
            </button>
        </div>
    );
}
