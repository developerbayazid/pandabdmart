'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { mockProducts, sortOptions } from '@/components/shop/mock-data';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ActiveFilters } from '@/components/shop/ActiveFilters';
import { ShopBanner } from '@/components/shop/ShopBanner';
import { Pagination } from '@/components/ui/pagination';
import { PRODUCTS_PER_PAGE } from '@/lib/constants/pagination';

export default function ShopPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState<string>('default');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const filteredProducts = useMemo(() => {
        let result = [...mockProducts];

        if (selectedCategories.length > 0) {
            result = result.filter((p) => selectedCategories.includes(p.category));
        }

        if (selectedColors.length > 0) {
            result = result.filter((p) => selectedColors.includes(p.color));
        }

        if (selectedTags.length > 0) {
            result = result.filter((p) => selectedTags.includes(p.category));
        }

        if (inStockOnly) {
            result = result.filter((p) => p.inStock);
        }

        result = result.filter(
            (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
        );

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => b.id - a.id);
                break;
            case 'popular':
                result.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return result;
    }, [selectedCategories, selectedColors, selectedTags, inStockOnly, priceRange, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const activeFilters = useMemo(() => {
        const filters: { type: string; label: string; value: string }[] = [];
        selectedCategories.forEach((c) =>
            filters.push({ type: 'category', label: c, value: c }),
        );
        selectedColors.forEach((c) =>
            filters.push({ type: 'color', label: c, value: c }),
        );
        selectedTags.forEach((t) =>
            filters.push({ type: 'tag', label: t, value: t }),
        );
        if (inStockOnly) {
            filters.push({ type: 'stock', label: 'In Stock', value: 'inStock' });
        }
        if (priceRange[0] > 0 || priceRange[1] < 100) {
            filters.push({
                type: 'price',
                label: `$${priceRange[0]} - $${priceRange[1]}`,
                value: `${priceRange[0]}-${priceRange[1]}`,
            });
        }
        return filters;
    }, [selectedCategories, selectedColors, selectedTags, inStockOnly, priceRange]);

    const handleRemoveFilter = (filter: { type: string; value: string }) => {
        switch (filter.type) {
            case 'category':
                setSelectedCategories((prev) => prev.filter((c) => c !== filter.value));
                break;
            case 'color':
                setSelectedColors((prev) => prev.filter((c) => c !== filter.value));
                break;
            case 'tag':
                setSelectedTags((prev) => prev.filter((t) => t !== filter.value));
                break;
            case 'stock':
                setInStockOnly(false);
                break;
            case 'price':
                setPriceRange([0, 100]);
                break;
        }
        setCurrentPage(1);
    };

    const handleClearAll = () => {
        setSelectedCategories([]);
        setSelectedColors([]);
        setSelectedTags([]);
        setInStockOnly(false);
        setPriceRange([0, 100]);
        setCurrentPage(1);
    };

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category],
        );
        setCurrentPage(1);
    };

    const handleColorToggle = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color)
                ? prev.filter((c) => c !== color)
                : [...prev, color],
        );
        setCurrentPage(1);
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
        setCurrentPage(1);
    };

    const handleInStockToggle = () => {
        setInStockOnly((prev) => !prev);
        setCurrentPage(1);
    };

    const handlePriceChange = (range: [number, number]) => {
        setPriceRange(range);
        setCurrentPage(1);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-16 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
                    <span className="hover:text-text-primary cursor-pointer transition-colors">
                        Home
                    </span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-text-primary font-medium">Shop</span>
                </nav>

                {/* Banner */}
                <ShopBanner />

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="lg:hidden flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                        </button>
                        <span className="text-[13px] text-text-secondary">
                            Showing {filteredProducts.length} products
                        </span>
                    </div>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="appearance-none bg-surface border border-border rounded-md px-3 py-2 pr-8 text-[13px] text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary cursor-pointer"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                    </div>
                </div>

                {/* Active Filters */}
                <ActiveFilters
                    filters={activeFilters}
                    onRemove={handleRemoveFilter}
                    onClearAll={handleClearAll}
                />

                {/* Main Content */}
                <div className="flex gap-8">
                    {/* Mobile Filter Drawer */}
                    {showMobileFilters && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div
                                className="absolute inset-0 bg-overlay/50"
                                onClick={() => setShowMobileFilters(false)}
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-surface border-r border-border p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-[16px] font-semibold text-text-primary">
                                        Filters
                                    </h2>
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="text-[13px] text-text-secondary hover:text-text-primary"
                                    >
                                        Close
                                    </button>
                                </div>
                                <FilterSidebar
                                    selectedCategories={selectedCategories}
                                    onCategoryToggle={handleCategoryToggle}
                                    priceRange={priceRange}
                                    onPriceChange={handlePriceChange}
                                    selectedColors={selectedColors}
                                    onColorToggle={handleColorToggle}
                                    selectedTags={selectedTags}
                                    onTagToggle={handleTagToggle}
                                    inStockOnly={inStockOnly}
                                    onInStockToggle={handleInStockToggle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block">
                        <FilterSidebar
                            selectedCategories={selectedCategories}
                            onCategoryToggle={handleCategoryToggle}
                            priceRange={priceRange}
                            onPriceChange={handlePriceChange}
                            selectedColors={selectedColors}
                            onColorToggle={handleColorToggle}
                            selectedTags={selectedTags}
                            onTagToggle={handleTagToggle}
                            inStockOnly={inStockOnly}
                            onInStockToggle={handleInStockToggle}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {paginatedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
                                    <SlidersHorizontal className="w-6 h-6 text-text-muted" />
                                </div>
                                <h3 className="text-[16px] font-semibold text-text-primary mb-1">
                                    No products found
                                </h3>
                                <p className="text-[13px] text-text-muted mb-4">
                                    Try adjusting your filters or browse all products.
                                </p>
                                <button
                                    onClick={handleClearAll}
                                    className="px-4 py-2 text-[13px] font-medium border border-text-primary text-text-primary rounded-md hover:bg-surface-inverse hover:text-text-inverse transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedProducts.map((product) => (
                                        <ShopProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-center mt-10">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        variant="compact"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
