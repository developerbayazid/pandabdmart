'use client';

import { categories, colors, tags } from './mock-data';

type FilterSidebarProps = {
    selectedCategories: string[];
    onCategoryToggle: (category: string) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    selectedColors: string[];
    onColorToggle: (color: string) => void;
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
    inStockOnly: boolean;
    onInStockToggle: () => void;
};

export function FilterSidebar({
    selectedCategories,
    onCategoryToggle,
    priceRange,
    onPriceChange,
    selectedColors,
    onColorToggle,
    selectedTags,
    onTagToggle,
    inStockOnly,
    onInStockToggle,
}: FilterSidebarProps) {
    return (
        <aside className="w-full lg:w-[260px] shrink-0 space-y-8">
            {/* Category */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Category
                </h3>
                <ul className="space-y-2.5">
                    {categories.map((category) => (
                        <li key={category}>
                            <button
                                onClick={() => onCategoryToggle(category)}
                                className={`text-[14px] font-medium transition-colors ${
                                    selectedCategories.includes(category)
                                        ? 'text-text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {category}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Price
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[13px] text-text-primary font-medium">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                    <div className="relative h-1 bg-border rounded-full">
                        <div
                            className="absolute h-1 bg-text-primary rounded-full"
                            style={{
                                left: `${(priceRange[0] / 100) * 100}%`,
                                right: `${100 - (priceRange[1] / 100) * 100}%`,
                            }}
                        />
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={priceRange[1]}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                onPriceChange([priceRange[0], val]);
                            }}
                            className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Color Filter */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Chose Color
                </h3>
                <ul className="space-y-2.5">
                    {colors.map((color) => (
                        <li key={color.name}>
                            <button
                                onClick={() => onColorToggle(color.name)}
                                className="flex items-center gap-3 text-[14px] font-medium transition-colors"
                            >
                                <span
                                    className={`w-3 h-3 rounded-full border ${
                                        selectedColors.includes(color.name)
                                            ? 'border-text-primary ring-1 ring-text-primary ring-offset-1'
                                            : 'border-border'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                />
                                <span
                                    className={`${
                                        selectedColors.includes(color.name)
                                            ? 'text-text-primary'
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {color.name}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Stock Toggle */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Availability
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={onInStockToggle}
                        className="w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary"
                    />
                    <span className="text-[14px] font-medium text-text-secondary">
                        In Stock Only
                    </span>
                </label>
            </div>

            {/* Product Tags */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Product Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onTagToggle(tag)}
                            className={`px-3 py-1 text-[12px] font-medium rounded-md border transition-colors ${
                                selectedTags.includes(tag)
                                    ? 'bg-surface-inverse text-text-inverse border-surface-inverse'
                                    : 'bg-surface text-text-secondary border-border hover:bg-surface-secondary'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
