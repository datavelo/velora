import React, { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface CollectionPageProps {
  categorySlug?: string;
  searchQuery?: string;
  products: Product[];
  categories: Category[];
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

export const CollectionPage: React.FC<CollectionPageProps> = ({
  categorySlug,
  searchQuery,
  products,
  categories,
  onNavigate,
  onSelectProduct,
}) => {
  const [selectedSort, setSelectedSort] = useState<SortOption>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter states
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Find active category
  const activeCategory = useMemo(() => {
    if (!categorySlug) return null;
    for (const cat of categories) {
      if (cat.slug === categorySlug) return cat;
      if (cat.subcategories) {
        const sub = cat.subcategories.find((s) => s.slug === categorySlug);
        if (sub) return sub;
      }
    }
    return null;
  }, [categorySlug, categories]);

  // Base filtered products for category or search query
  const baseCategoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.item_code.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.attributes.some((a) => a.value.toLowerCase().includes(q))
        );
      }

      if (!categorySlug || categorySlug === 'all') return true;

      // Category match
      const matchesCategory =
        p.category?.slug === categorySlug ||
        p.subcategory?.slug === categorySlug ||
        p.category_id === activeCategory?.id ||
        p.subcategory_id === activeCategory?.id;

      return matchesCategory;
    });
  }, [products, categorySlug, activeCategory, searchQuery]);

  // Extract all available filter attributes dynamically from base products
  const availableFilterAttributes = useMemo(() => {
    const map: Record<string, Set<string>> = {};

    baseCategoryProducts.forEach((p) => {
      // Custom attributes marked is_filterable
      p.attributes?.forEach((attr) => {
        if (attr.is_filterable && attr.name && attr.value) {
          if (!map[attr.name]) map[attr.name] = new Set();
          map[attr.name].add(attr.value);
        }
      });

      // Product option values (like Size, Color, Volume)
      p.options?.forEach((opt) => {
        if (!map[opt.name]) map[opt.name] = new Set();
        opt.values.forEach((v) => map[opt.name].add(v.value));
      });
    });

    const result: Record<string, string[]> = {};
    Object.entries(map).forEach(([key, set]) => {
      if (set.size > 0) result[key] = Array.from(set);
    });
    return result;
  }, [baseCategoryProducts]);

  // Toggle an attribute filter value
  const toggleAttributeFilter = (attrName: string, val: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrName] || [];
      const updated = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      const copy = { ...prev };
      if (updated.length > 0) {
        copy[attrName] = updated;
      } else {
        delete copy[attrName];
      }
      return copy;
    });
  };

  const clearAllFilters = () => {
    setSelectedAttributes({});
    setInStockOnly(false);
    setMaxPrice(null);
  };

  const activeFilterCount =
    (Object.values(selectedAttributes) as string[][]).reduce((sum, arr) => sum + arr.length, 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice !== null ? 1 : 0);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let list = baseCategoryProducts.filter((p) => {
      if (inStockOnly && p.stock <= 0) return false;

      const price = p.offer_price_lkr ?? p.normal_price_lkr;
      if (maxPrice !== null && price > maxPrice) return false;

      // Check all selected attributes
      for (const [attrName, selectedVals] of Object.entries(selectedAttributes) as [string, string[]][]) {
        if (!selectedVals || selectedVals.length === 0) continue;

        // Check product attributes
        const hasAttr = p.attributes.some(
          (a) => a.name === attrName && selectedVals.includes(a.value)
        );

        // Check product options & variants
        const hasOpt = p.options.some(
          (o) => o.name === attrName && o.values.some((v) => selectedVals.includes(v.value))
        );

        if (!hasAttr && !hasOpt) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      const priceA = a.offer_price_lkr ?? a.normal_price_lkr;
      const priceB = b.offer_price_lkr ?? b.normal_price_lkr;

      switch (selectedSort) {
        case 'newest':
          return (
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'featured':
        default:
          return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

    return list;
  }, [baseCategoryProducts, inStockOnly, maxPrice, selectedAttributes, selectedSort]);

  const pageTitle = searchQuery
    ? `Search Results for "${searchQuery}"`
    : activeCategory
    ? activeCategory.name
    : 'All Collections';

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 pb-24">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-500 mb-6">
        <button onClick={() => onNavigate('/')} className="hover:text-black transition-colors">
          Home
        </button>
        <span>/</span>
        {activeCategory?.parent_id && (
          <>
            <button
              onClick={() => onNavigate(`/category/${categorySlug?.split('-')[0]}`)}
              className="hover:text-black transition-colors uppercase"
            >
              Collection
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-black font-semibold uppercase">{pageTitle}</span>
      </nav>

      {/* 2. Collection Header */}
      <div className="mb-8 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold tracking-wider uppercase text-neutral-950">
              {pageTitle}
            </h1>
            {activeCategory?.description && (
              <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-3xl font-normal leading-relaxed">
                {activeCategory.description}
              </p>
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold text-neutral-600 uppercase tracking-widest shrink-0">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'}
          </span>
        </div>
      </div>

      {/* 3. Filter Bar & Sorting Row */}
      <div className="flex items-center justify-between gap-4 mb-8 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          {activeFilterCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs sm:text-sm text-neutral-600 font-medium">
                {activeFilterCount} active filters:
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs sm:text-sm text-gold font-bold hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-neutral-600 hidden sm:inline" />
          <span className="text-xs sm:text-sm text-neutral-700 uppercase tracking-wider font-semibold hidden sm:inline">
            Sort by:
          </span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as SortOption)}
            className="bg-white border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-semibold py-2 px-3 rounded focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* 4. Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6 pr-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h3 className="font-heading text-sm sm:text-base font-bold tracking-wider uppercase text-neutral-900">
              Refine Collection
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs sm:text-sm font-semibold text-neutral-500 hover:text-black"
              >
                Reset
              </button>
            )}
          </div>

          {/* Availability filter */}
          <div className="space-y-2 pb-5 border-b border-neutral-150">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-800 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-gold"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Dynamic Attribute Filter Groups */}
          {(Object.entries(availableFilterAttributes) as [string, string[]][]).map(([attrName, values]) => (
            <div key={attrName} className="space-y-3 pb-5 border-b border-neutral-150">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900">
                {attrName}
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {values.map((val) => {
                  const isChecked = selectedAttributes[attrName]?.includes(val) || false;
                  return (
                    <label
                      key={val}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700 hover:text-black cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleAttributeFilter(attrName, val)}
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-gold"
                      />
                      <span>{val}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 rounded-lg border border-neutral-200 p-8 space-y-4">
              <p className="font-heading text-lg text-neutral-800 uppercase font-bold">
                No matching products found
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No items match your active filter combination. Try clearing some filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onSelectProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Filter Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-black" />
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Filters</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {/* In stock */}
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-gold"
                />
                <span>In Stock Only</span>
              </label>

              {/* Dynamic attributes */}
              {(Object.entries(availableFilterAttributes) as [string, string[]][]).map(([attrName, values]) => (
                <div key={attrName} className="space-y-2 border-t border-neutral-150 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    {attrName}
                  </h4>
                  <div className="space-y-1.5">
                    {values.map((val) => {
                      const isChecked = selectedAttributes[attrName]?.includes(val) || false;
                      return (
                        <label
                          key={val}
                          className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAttributeFilter(attrName, val)}
                            className="w-4 h-4 rounded text-black focus:ring-gold"
                          />
                          <span>{val}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-bold uppercase rounded text-neutral-700"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded"
              >
                View ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
