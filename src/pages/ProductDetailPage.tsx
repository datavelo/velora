import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Share2,
} from 'lucide-react';
import { Product, ProductVariant, SiteSettings } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { ProductCard } from '../components/product/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  settings: SiteSettings;
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
  onInstantBuy: (product: Product, selectedOptions: Record<string, string>, variant: ProductVariant | null, qty: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  settings,
  onNavigate,
  onSelectProduct,
  onInstantBuy,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Initialize selected options (e.g. Color, Size, Volume)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options?.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        initial[opt.name] = opt.values[0].value;
      }
    });
    return initial;
  });

  // Find active matched variant
  const activeVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants || product.variants.length === 0) return null;

    return (
      product.variants.find((variant) => {
        return Object.entries(selectedOptions).every(
          ([key, value]) => variant.combination[key] === value
        );
      }) || null
    );
  }, [product.variants, selectedOptions]);

  // Determine stock availability
  const currentStock = activeVariant ? activeVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  // Authoritative unit price for this product or selected variant
  const basePrice = product.offer_price_lkr ?? product.normal_price_lkr;
  const unitPrice =
    activeVariant?.price_override_lkr !== null && activeVariant?.price_override_lkr !== undefined
      ? activeVariant.price_override_lkr
      : basePrice;

  // Live Instant Calculations
  const deliveryFee = settings.delivery.delivery_enabled ? settings.delivery.islandwide_fee_lkr : 0;
  const itemsSubtotal = Math.round(unitPrice * quantity);
  const grandTotal = itemsSubtotal + deliveryFee;

  const isDiscounted =
    product.offer_price_lkr && product.offer_price_lkr < product.normal_price_lkr;
  const discountPercent = isDiscounted
    ? Math.round(
        ((product.normal_price_lkr - (product.offer_price_lkr || 0)) /
          product.normal_price_lkr) *
          100
      )
    : 0;

  // Images
  const images = product.images.length > 0
    ? product.images
    : [{ image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000', sort_order: 0, is_primary: true }];

  // Change selected option
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedOptions, activeVariant, quantity);
    showToast(`Added ${quantity} item(s) of "${product.name}" to cart.`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onInstantBuy(product, selectedOptions, activeVariant, quantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on VELORA`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard.', 'info');
    }
  };

  // Related products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category_id === product.category_id && p.is_active)
    .slice(0, 4);

  return (
    <div className="max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 pb-24 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-500">
        <button onClick={() => onNavigate('/')} className="hover:text-black transition-colors">
          Home
        </button>
        <span>/</span>
        {product.category && (
          <>
            <button
              onClick={() => onNavigate(`/category/${product.category?.slug}`)}
              className="hover:text-black transition-colors uppercase"
            >
              {product.category.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-black font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Main Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* LEFT: Image Gallery (Col 7) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Desktop Thumbnails Column */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 md:w-20 md:h-24 rounded overflow-hidden border-2 transition-all shrink-0 bg-neutral-100 ${
                    selectedImageIndex === idx
                      ? 'border-gold shadow-sm'
                      : 'border-neutral-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.thumbnail_url || img.image_url}
                    alt={img.alt_text || `${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Primary Main Image Stage */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 group">
            <img
              src={images[selectedImageIndex]?.image_url}
              alt={images[selectedImageIndex]?.alt_text || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gallery Navigation Arrows for mobile / multiple images */}
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-white/80 hover:bg-white text-black shadow-md transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-white/80 hover:bg-white text-black shadow-md transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Product Information & Live Calculator (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-2.5 border-b border-neutral-200 pb-5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gold">
                {product.brand}
              </span>
              <button
                onClick={handleShare}
                className="p-2 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-wide uppercase text-neutral-950 leading-snug">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs sm:text-sm text-neutral-500 font-mono tracking-wider">
                ITEM CODE: {activeVariant?.sku || product.item_code}
              </span>
              <span className="text-neutral-300">•</span>
              {isOutOfStock ? (
                <span className="text-xs sm:text-sm font-bold text-red-600 uppercase tracking-wider">
                  Sold Out
                </span>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  In Stock ({currentStock} available)
                </span>
              )}
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                Rs. {unitPrice.toLocaleString('en-US')}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-sm sm:text-base text-neutral-400 line-through">
                    Rs. {product.normal_price_lkr.toLocaleString('en-US')}
                  </span>
                  <span className="bg-[#111111] text-gold border border-gold/40 text-xs font-bold px-2.5 py-0.5 rounded">
                    SAVE {discountPercent}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Dynamic Variant Selectors */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4 border-b border-neutral-200 pb-5">
              {product.options.map((option) => (
                <div key={option.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-neutral-800">
                      {option.name}:
                    </span>
                    <span className="font-semibold text-black">
                      {selectedOptions[option.name]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {option.values.map((v) => {
                      const isSelected = selectedOptions[option.name] === v.value;
                      return (
                        <button
                          key={v.value}
                          type="button"
                          onClick={() => handleOptionSelect(option.name, v.value)}
                          className={`px-3.5 py-2 text-xs font-semibold rounded border transition-all ${
                            isSelected
                              ? 'bg-black text-white border-black shadow-xs'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                          }`}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. Live Quantity / Price Calculator Component */}
          <div className="bg-neutral-50 rounded-lg p-4 sm:p-5 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                Quantity
              </span>
              {/* Stepper */}
              <div className="flex items-center border border-neutral-300 rounded bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 text-sm font-bold text-neutral-900 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(currentStock || 99, q + 1))}
                  disabled={quantity >= currentStock}
                  className="px-3 py-2 text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Instant Authoritative Calculation Breakdown */}
            <div className="space-y-2 text-xs sm:text-sm text-neutral-600 border-t border-neutral-200 pt-3">
              <div className="flex justify-between">
                <span>
                  Unit Price (Rs. {unitPrice.toLocaleString('en-US')}) × {quantity}
                </span>
                <span className="font-semibold text-neutral-900">
                  Rs. {itemsSubtotal.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Islandwide Express Delivery</span>
                <span className="font-semibold text-neutral-900">
                  Rs. {deliveryFee.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm sm:text-base font-bold text-black">
                <span>Estimated Grand Total</span>
                <span className="text-base sm:text-lg text-gold font-extrabold">
                  Rs. {grandTotal.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now via WhatsApp */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-white border-2 border-black text-black text-xs sm:text-sm font-bold uppercase tracking-widest rounded hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-4 px-6 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-gold" />
              <span>BUY NOW (SEND ORDER VIA WHATSAPP)</span>
            </button>

            <p className="text-xs text-center text-neutral-500">
              No account creation required. Direct WhatsApp confirmation to 94778005550.
            </p>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="border-t border-neutral-200 pt-5 space-y-3 text-xs sm:text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gold shrink-0" />
              <span>
                <strong>Islandwide Delivery:</strong> {settings.delivery.estimated_days} (Flat Rs.{' '}
                {settings.delivery.islandwide_fee_lkr})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
              <span>
                <strong>Authenticity Guaranteed:</strong> 100% genuine craftsmanship &amp; inspection
              </span>
            </div>
          </div>

          {/* Description & Item Details / Specifications */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-2">
                Description
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Exclusive luxury piece crafted by VELORA Sri Lanka.'}
              </p>
            </div>

            {product.item_details && (
              <div className="pt-2">
                <h3 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-2">
                  Specifications &amp; Care
                </h3>
                <pre className="text-xs sm:text-sm text-neutral-600 font-sans leading-relaxed whitespace-pre-line">
                  {product.item_details}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-neutral-200 pt-16">
          <div className="mb-8">
            <span className="text-xs sm:text-sm font-bold text-gold tracking-widest uppercase">
              YOU MAY ALSO LIKE
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-wider text-neutral-950 uppercase mt-1">
              RELATED PIECES
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => onSelectProduct(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
