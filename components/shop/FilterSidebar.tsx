'use client';

type FilterOption = {
    slug: string;
    name: string;
};

type FilterSidebarProps = {
    categories: FilterOption[];
    brands: FilterOption[];
    selectedCategories: string[];
    onCategoryToggle: (slug: string) => void;
    priceRange: [number, number];
    priceBounds: { min: number; max: number };
    onPriceChange: (range: [number, number]) => void;
    selectedBrands: string[];
    onBrandToggle: (slug: string) => void;
    inStockOnly: boolean;
    onInStockToggle: () => void;
};

export function FilterSidebar({
    categories,
    brands,
    selectedCategories,
    onCategoryToggle,
    priceRange,
    priceBounds,
    onPriceChange,
    selectedBrands,
    onBrandToggle,
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
                        <li key={category.slug}>
                            <button
                                onClick={() => onCategoryToggle(category.slug)}
                                className={`text-[14px] font-medium transition-colors ${
                                    selectedCategories.includes(category.slug)
                                        ? 'text-text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {category.name}
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
                        <span>৳{priceRange[0]}</span>
                        <span>৳{priceRange[1]}</span>
                    </div>
                    <div className="relative h-1 bg-border rounded-full">
                        <div
                            className="absolute h-1 bg-text-primary rounded-full"
                            style={{
                                left: `${((priceRange[0] - priceBounds.min) / (priceBounds.max - priceBounds.min || 1)) * 100}%`,
                                right: `${100 - ((priceRange[1] - priceBounds.min) / (priceBounds.max - priceBounds.min || 1)) * 100}%`,
                            }}
                        />
                        <input
                            type="range"
                            min={priceBounds.min}
                            max={priceBounds.max}
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

            {/* Brand Filter */}
            <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border">
                    Brand
                </h3>
                <ul className="space-y-2.5">
                    {brands.map((brand) => (
                        <li key={brand.slug}>
                            <button
                                onClick={() => onBrandToggle(brand.slug)}
                                className={`text-[14px] font-medium transition-colors ${
                                    selectedBrands.includes(brand.slug)
                                        ? 'text-text-primary'
                                        : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {brand.name}
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
        </aside>
    );
}
