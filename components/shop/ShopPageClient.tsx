'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ActiveFilters } from '@/components/shop/ActiveFilters';
import { ShopBanner } from '@/components/shop/ShopBanner';
import { Pagination } from '@/components/ui/pagination';
import { sortOptions } from '@/components/shop/mock-data';
import type { ShopProduct, ShopFilterOptions } from '@/types/shop';

type ShopPageClientProps = {
    products: ShopProduct[];
    total: number;
    page: number;
    totalPages: number;
    filterOptions: ShopFilterOptions;
};

export function ShopPageClient({
    products,
    total,
    page,
    totalPages,
    filterOptions,
}: ShopPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const selectedCategories = searchParams.getAll('category');
    const selectedBrands = searchParams.getAll('brand');
    const sortBy = searchParams.get('sort') ?? 'default';
    const searchQuery = searchParams.get('q') ?? '';

    const [searchInput, setSearchInput] = useState(searchQuery);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setSearchInput(searchQuery);
    }, [searchQuery]);
    const inStockOnly = searchParams.get('stock') === '1';
    const currentPage = page;
    const priceMin = parseInt(searchParams.get('minPrice') ?? String(filterOptions.priceRange.min), 10);
    const priceMax = parseInt(searchParams.get('maxPrice') ?? String(filterOptions.priceRange.max), 10);

    const updateParams = useCallback(
        (updates: Record<string, string | string[] | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                params.delete(key);
                if (value === null || value === '') continue;
                if (Array.isArray(value)) {
                    value.forEach((v) => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            }
            if (!updates.page) params.delete('page');
            router.push(`/shop?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    const handleCategoryToggle = useCallback(
        (slug: string) => {
            const current = searchParams.getAll('category');
            const next = current.includes(slug)
                ? current.filter((c) => c !== slug)
                : [...current, slug];
            updateParams({ category: next.length ? next : null });
        },
        [searchParams, updateParams],
    );

    const handleBrandToggle = useCallback(
        (slug: string) => {
            const current = searchParams.getAll('brand');
            const next = current.includes(slug)
                ? current.filter((b) => b !== slug)
                : [...current, slug];
            updateParams({ brand: next.length ? next : null });
        },
        [searchParams, updateParams],
    );

    const handlePriceChange = useCallback(
        (range: [number, number]) => {
            updateParams({
                minPrice: range[0] !== filterOptions.priceRange.min ? String(range[0]) : null,
                maxPrice: range[1] !== filterOptions.priceRange.max ? String(range[1]) : null,
            });
        },
        [updateParams, filterOptions.priceRange],
    );

    const handleInStockToggle = useCallback(() => {
        updateParams({ stock: inStockOnly ? null : '1' });
    }, [updateParams, inStockOnly]);

    const handleSortChange = useCallback(
        (value: string) => {
            updateParams({ sort: value === 'default' ? null : value });
        },
        [updateParams],
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateParams({ page: newPage > 1 ? String(newPage) : null });
        },
        [updateParams],
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchInput(value);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
                updateParams({ q: value.trim() || null });
            }, 300);
        },
        [updateParams],
    );

    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    const handleRemoveFilter = useCallback(
        (filter: { type: string; value: string }) => {
            switch (filter.type) {
                case 'category':
                    handleCategoryToggle(filter.value);
                    break;
                case 'brand':
                    handleBrandToggle(filter.value);
                    break;
                case 'stock':
                    updateParams({ stock: null });
                    break;
                case 'price':
                    updateParams({ minPrice: null, maxPrice: null });
                    break;
            }
        },
        [handleCategoryToggle, handleBrandToggle, updateParams],
    );

    const handleClearAll = useCallback(() => {
        updateParams({
            category: null,
            brand: null,
            minPrice: null,
            maxPrice: null,
            stock: null,
            sort: null,
            q: null,
        });
    }, [updateParams]);

    const activeFilters = useMemo(() => {
        const filters: { type: string; label: string; value: string }[] = [];

        for (const slug of selectedCategories) {
            const cat = filterOptions.categories.find((c) => c.slug === slug);
            filters.push({
                type: 'category',
                label: cat?.name ?? slug,
                value: slug,
            });
        }

        for (const slug of selectedBrands) {
            const brand = filterOptions.brands.find((b) => b.slug === slug);
            filters.push({
                type: 'brand',
                label: brand?.name ?? slug,
                value: slug,
            });
        }

        if (inStockOnly) {
            filters.push({ type: 'stock', label: 'In Stock', value: 'inStock' });
        }

        if (
            priceMin > filterOptions.priceRange.min ||
            priceMax < filterOptions.priceRange.max
        ) {
            filters.push({
                type: 'price',
                label: `৳${priceMin} - ৳${priceMax}`,
                value: `${priceMin}-${priceMax}`,
            });
        }

        return filters;
    }, [selectedCategories, selectedBrands, inStockOnly, priceMin, priceMax, filterOptions]);

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

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary"
                        />
                    </div>
                </div>

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
                            Showing {total} products
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
                                    categories={filterOptions.categories}
                                    brands={filterOptions.brands}
                                    selectedCategories={selectedCategories}
                                    onCategoryToggle={handleCategoryToggle}
                                    priceRange={[priceMin, priceMax]}
                                    priceBounds={filterOptions.priceRange}
                                    onPriceChange={handlePriceChange}
                                    selectedBrands={selectedBrands}
                                    onBrandToggle={handleBrandToggle}
                                    inStockOnly={inStockOnly}
                                    onInStockToggle={handleInStockToggle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block">
                        <FilterSidebar
                            categories={filterOptions.categories}
                            brands={filterOptions.brands}
                            selectedCategories={selectedCategories}
                            onCategoryToggle={handleCategoryToggle}
                            priceRange={[priceMin, priceMax]}
                            priceBounds={filterOptions.priceRange}
                            onPriceChange={handlePriceChange}
                            selectedBrands={selectedBrands}
                            onBrandToggle={handleBrandToggle}
                            inStockOnly={inStockOnly}
                            onInStockToggle={handleInStockToggle}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {products.length === 0 ? (
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
                                    {products.map((product) => (
                                        <ProductCard
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
