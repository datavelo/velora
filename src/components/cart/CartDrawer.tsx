import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    subtotal_lkr,
    delivery_fee_lkr,
    total_lkr,
    itemCount,
    isCartOpen,
    setIsCartOpen,
    updateQty,
    removeFromCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-in Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="font-heading text-base font-bold tracking-wider uppercase text-neutral-900">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-neutral-150">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-800">Your cart is empty</h3>
                <p className="text-xs text-neutral-500">Discover Velora's latest collections.</p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-black transition-colors"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const image =
                item.variant?.image_url ||
                item.product.images[0]?.thumbnail_url ||
                item.product.images[0]?.image_url;

              return (
                <div key={item.cart_item_id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-100 rounded overflow-hidden shrink-0 border border-neutral-150">
                    {image && (
                      <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-xs text-neutral-400 font-mono">
                          {item.variant?.sku || item.product.item_code}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cart_item_id)}
                        className="text-neutral-400 hover:text-red-600 p-1.5 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variant tags */}
                    {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(item.selected_options).map(([k, v]) => (
                          <span
                            key={k}
                            className="bg-neutral-100 text-neutral-700 text-xs px-2 py-0.5 rounded font-medium"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Pricing & Qty Controls */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded overflow-hidden">
                        <button
                          onClick={() => updateQty(item.cart_item_id, item.qty - 1)}
                          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-200 text-neutral-600 text-xs transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3.5 py-1 text-xs sm:text-sm font-bold text-neutral-900">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.cart_item_id, item.qty + 1)}
                          className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-200 text-neutral-600 text-xs transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-neutral-950">
                          Rs. {item.line_total_lkr.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Footer / Calculations */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 space-y-3.5">
            {/* Live Calculation rows */}
            <div className="space-y-2 text-xs sm:text-sm text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">
                  Rs. {subtotal_lkr.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Islandwide Delivery</span>
                <span className="font-semibold text-neutral-900">
                  Rs. {delivery_fee_lkr.toLocaleString('en-US')}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm sm:text-base font-bold text-neutral-950">
                <span>Total Amount</span>
                <span className="text-base sm:text-lg text-black font-extrabold">
                  Rs. {total_lkr.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
              className="w-full py-4 px-4 bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-center text-neutral-500">
              Instant WhatsApp Order Confirmation • No Account Needed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
