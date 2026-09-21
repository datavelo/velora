import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { Store } from '../lib/store';

interface CartContextType {
  cart: CartItem[];
  subtotal_lkr: number;
  delivery_fee_lkr: number;
  total_lkr: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    selectedOptions?: Record<string, string>,
    variant?: ProductVariant | null,
    qty?: number
  ) => void;
  updateQty: (cartItemId: string, qty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  refreshCartCalculations: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => Store.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(() => {
    const settings = Store.getSettings();
    return settings.delivery.delivery_enabled ? settings.delivery.islandwide_fee_lkr : 0;
  });

  // Keep storage in sync
  useEffect(() => {
    Store.saveCart(cart);
  }, [cart]);

  // Update delivery fee if settings change
  const refreshCartCalculations = useCallback(() => {
    const settings = Store.getSettings();
    setDeliveryFee(settings.delivery.delivery_enabled ? settings.delivery.islandwide_fee_lkr : 0);
  }, []);

  const addToCart = (
    product: Product,
    selectedOptions: Record<string, string> = {},
    variant: ProductVariant | null = null,
    qty = 1
  ) => {
    const cartItemId = `${product.id}-${variant?.id || 'standard'}`;
    const unitPrice =
      variant?.price_override_lkr !== null && variant?.price_override_lkr !== undefined
        ? variant.price_override_lkr
        : (product.offer_price_lkr ?? product.normal_price_lkr);

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cart_item_id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: newQty,
          line_total_lkr: Math.round(unitPrice * newQty),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cart_item_id: cartItemId,
          product_id: product.id,
          product,
          variant_id: variant?.id || null,
          variant,
          selected_options: selectedOptions,
          qty,
          unit_price_lkr: unitPrice,
          line_total_lkr: Math.round(unitPrice * qty),
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cart_item_id === cartItemId) {
          return {
            ...item,
            qty: newQty,
            line_total_lkr: Math.round(item.unit_price_lkr * newQty),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    Store.clearCart();
  };

  // Calculations
  const subtotal_lkr = cart.reduce((sum, item) => sum + item.line_total_lkr, 0);
  const total_lkr = subtotal_lkr > 0 ? subtotal_lkr + deliveryFee : 0;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal_lkr,
        delivery_fee_lkr: cart.length > 0 ? deliveryFee : 0,
        total_lkr,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refreshCartCalculations,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
