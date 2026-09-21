import React, { useState } from 'react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    product.images.find((img) => img.is_primary) || product.images[0];
  const secondaryImage =
    product.images.find((img) => !img.is_primary) || product.images[1];

  const currentPrice = product.offer_price_lkr ?? product.normal_price_lkr;
  const isDiscounted =
    product.offer_price_lkr && product.offer_price_lkr < product.normal_price_lkr;

  const discountPercent = isDiscounted
    ? Math.round(
        ((product.normal_price_lkr - (product.offer_price_lkr || 0)) /
          product.normal_price_lkr) *
          100
      )
    : 0;

  const isSoldOut = product.stock <= 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* Image Container with Consistent Aspect Ratio */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden rounded-md mb-3">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {isSoldOut ? (
            <span className="bg-neutral-900/90 backdrop-blur-xs text-white text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded">
              SOLD OUT
            </span>
          ) : (
            <>
              {isDiscounted && (
                <span className="bg-[#111111] text-gold border border-gold/40 text-xs font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
                  SAVE {discountPercent}%
                </span>
              )}
              {product.is_new && (
                <span className="bg-white/95 text-black text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded shadow-xs">
                  NEW
                </span>
              )}
              {product.is_best_seller && !product.is_new && (
                <span className="bg-neutral-900 text-neutral-200 text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                  BESTSELLER
                </span>
              )}
            </>
          )}
        </div>

        {/* Primary Image */}
        {primaryImage && (
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
              secondaryImage && isHovered ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-[1.03] transition-transform duration-700`}
          />
        )}

        {/* Secondary Hover Image */}
        {secondaryImage && (
          <img
            src={secondaryImage.image_url}
            alt={secondaryImage.alt_text || product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
              isHovered ? 'opacity-100 scale-[1.03]' : 'opacity-0'
            } transition-transform duration-700`}
          />
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col space-y-1.5 pt-1">
        <span className="text-xs sm:text-[13px] uppercase tracking-wider font-semibold text-neutral-500">
          {product.brand}
        </span>
        <h3 className="text-sm sm:text-[15px] font-semibold text-neutral-950 line-clamp-2 leading-snug group-hover:text-gold transition-colors">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm sm:text-base font-bold text-neutral-950">
            Rs. {currentPrice.toLocaleString('en-US')}
          </span>
          {isDiscounted && (
            <span className="text-xs sm:text-[13px] text-neutral-400 line-through">
              Rs. {product.normal_price_lkr.toLocaleString('en-US')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
