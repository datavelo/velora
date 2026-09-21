import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const filtered = products.filter((p) => {
        if (!p.is_active) return false;
        const nameMatch = p.name.toLowerCase().includes(trimmed);
        const skuMatch = p.item_code.toLowerCase().includes(trimmed);
        const brandMatch = p.brand.toLowerCase().includes(trimmed);
        const descMatch = p.description?.toLowerCase().includes(trimmed);
        const attrMatch = p.attributes?.some((a) => a.value.toLowerCase().includes(trimmed));
        return nameMatch || skuMatch || brandMatch || descMatch || attrMatch;
      });
      setResults(filtered.slice(0, 8));
    }, 150);

    return () => clearTimeout(timer);
  }, [query, products]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white/98 backdrop-blur-md animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="border-b border-neutral-200 p-4 sm:p-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products by name, SKU (e.g. VL-W-0101), brand or style..."
              className="w-full pl-11 pr-4 py-3 bg-neutral-100/80 rounded-lg text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-xs text-neutral-400 hover:text-black uppercase font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 sm:p-6">
        {query.trim() === '' ? (
          <div className="space-y-4 pt-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['Oversized T-Shirt', 'Titanium Aviator', 'Leggings', 'Nuit Dorée', 'Chronograph', 'Ceramic Watch'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-700 hover:border-gold hover:text-black transition-colors"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-150">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {results.length} Suggestions Found
              </span>
              <button
                onClick={() => {
                  onSearchSubmit(query.trim());
                  onClose();
                }}
                className="text-xs font-bold text-black hover:text-gold flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View all results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {results.map((product) => {
                const img = product.images[0]?.thumbnail_url || product.images[0]?.image_url;
                const price = product.offer_price_lkr ?? product.normal_price_lkr;
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 p-2.5 rounded-lg border border-neutral-150 hover:border-gold/60 hover:shadow-xs transition-all cursor-pointer bg-white"
                  >
                    <div className="w-14 h-16 bg-neutral-100 rounded overflow-hidden shrink-0">
                      {img && <img src={img} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {product.item_code}
                      </span>
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">{product.name}</h4>
                      <p className="text-xs font-bold text-black mt-0.5">
                        Rs. {price.toLocaleString('en-US')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm font-medium text-neutral-600">No products found matching "{query}"</p>
            <p className="text-xs text-neutral-400 mt-1">Try checking for typos or search by category name.</p>
          </div>
        )}
      </div>
    </div>
  );
};
