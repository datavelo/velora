import {
  Category,
  Product,
  Order,
  SiteSettings,
  CartItem,
  CheckoutFormData,
  OrderItemSnapshot,
  OrderStatus,
} from '../types';
import { DEFAULT_SETTINGS, DEMO_CATEGORIES, DEMO_PRODUCTS } from './demoData';

const STORAGE_KEYS = {
  SETTINGS: 'velora_settings_v1',
  CATEGORIES: 'velora_categories_v1',
  PRODUCTS: 'velora_products_v1',
  ORDERS: 'velora_orders_v1',
  CART: 'velora_cart_v1',
  ADMIN_SESSION: 'velora_admin_session_v1',
  ORDER_SEQ: 'velora_order_seq_v1',
};

// Helper to initialize local storage if empty
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    // Initial sample orders for previewing admin dashboard & invoice
    const initialOrders: Order[] = [
      {
        id: 'ord-demo-001',
        order_number: 'VL-20260907-0001',
        customer_name: 'Kasun Perera',
        phone: '0771234567',
        whatsapp: '0771234567',
        address: 'No 10, Main Road, Colombo 05',
        city: 'Colombo',
        district: 'Colombo',
        note: 'Please call before delivery in morning hours.',
        subtotal_lkr: 8800,
        delivery_fee_lkr: 500,
        total_lkr: 9300,
        status: 'confirmed',
        payment_method: 'bank_transfer',
        payment_status: 'paid',
        payment_confirmed_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        payment_reference: 'BT-COM-94821',
        waybill_number: 'VLR-PRX-9021849',
        courier_name: 'Pronto Logistics Express',
        tracking_url: 'https://pronto.lk/track/VLR-PRX-9021849',
        is_demo: true,
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        confirmed_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'item-001',
            product_id: 'prod-001',
            variant_id: 'v-001-blk-m',
            product_name_snapshot: 'Velora Monogram Heavyweight Oversized T-Shirt',
            item_code_snapshot: 'VL-W01-BM',
            variant_snapshot: { Color: 'Obsidian Black', Size: 'M' },
            qty: 2,
            unit_price_lkr: 4400,
            line_total_lkr: 8800,
            product_image_snapshot: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'ord-demo-002',
        order_number: 'VL-20260907-0002',
        customer_name: 'Amali Wijesinghe',
        phone: '0719876543',
        whatsapp: '0719876543',
        address: '45/B, Peradeniya Road',
        city: 'Kandy',
        district: 'Kandy',
        note: null,
        subtotal_lkr: 12900,
        delivery_fee_lkr: 500,
        total_lkr: 13400,
        status: 'pending',
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        payment_confirmed_at: null,
        payment_reference: null,
        waybill_number: null,
        courier_name: null,
        tracking_url: null,
        is_demo: true,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'item-002',
            product_id: 'prod-004',
            variant_id: 'v-004-gold-smk',
            product_name_snapshot: 'Solarium Titanium Aviator Sunglasses',
            item_code_snapshot: 'VL-SUN-GDSMK',
            variant_snapshot: { 'Frame Color': 'Brushed Champagne Gold', 'Lens Color': 'Polarized Smoke Black' },
            qty: 1,
            unit_price_lkr: 12900,
            line_total_lkr: 12900,
            product_image_snapshot: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop',
          },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
  }
}

// Generate sequential order number VL-YYYYMMDD-XXXX
export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateKey = `${y}${m}${d}`;

  let seqData: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDER_SEQ);
    if (raw) seqData = JSON.parse(raw);
  } catch (e) {
    seqData = {};
  }

  const currentCount = (seqData[dateKey] || 0) + 1;
  seqData[dateKey] = currentCount;
  localStorage.setItem(STORAGE_KEYS.ORDER_SEQ, JSON.stringify(seqData));

  const seqStr = String(currentCount).padStart(4, '0');
  return `VL-${dateKey}-${seqStr}`;
}

// Store API
export const Store = {
  // SETTINGS
  getSettings(): SiteSettings {
    initializeStorage();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(settings: SiteSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  saveSettings(settings: SiteSettings): void {
    this.updateSettings(settings);
  },

  // CATEGORIES
  getCategories(): Category[] {
    initializeStorage();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return raw ? JSON.parse(raw) : DEMO_CATEGORIES;
    } catch {
      return DEMO_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  upsertCategory(category: Category): Category {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = { ...category };
    } else {
      categories.push({
        ...category,
        id: category.id || `cat-${Date.now()}`,
      });
    }
    this.saveCategories(categories);
    return category;
  },

  saveCategory(category: Category): Category {
    return this.upsertCategory(category);
  },

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id && c.parent_id !== id);
    this.saveCategories(filtered);
  },

  // PRODUCTS
  getProducts(): Product[] {
    initializeStorage();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return raw ? JSON.parse(raw) : DEMO_PRODUCTS;
    } catch {
      return DEMO_PRODUCTS;
    }
  },

  getProductBySlug(slug: string): Product | null {
    const products = this.getProducts();
    return products.find((p) => p.slug.toLowerCase() === slug.toLowerCase() && p.is_active) || null;
  },

  getProductById(id: string): Product | null {
    const products = this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  upsertProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product, updated_at: new Date().toISOString() };
    } else {
      products.unshift({
        ...product,
        id: product.id || `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    this.saveProducts(products);
    return product;
  },

  saveProduct(product: Product): Product {
    return this.upsertProduct(product);
  },

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
  },

  // CART (Temporary Client Persistence)
  getCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CART);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  },

  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CART);
  },

  // Authoritative price calculation:
  // Revalidates product/variant prices against store data (never trusts client input alone)
  calculateAuthoritativeOrder(
    items: Array<{ product_id: string; variant_id?: string | null; qty: number }>
  ): {
    subtotal_lkr: number;
    delivery_fee_lkr: number;
    total_lkr: number;
    validated_items: OrderItemSnapshot[];
  } {
    const products = this.getProducts();
    const settings = this.getSettings();
    let subtotal_lkr = 0;
    const validated_items: OrderItemSnapshot[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) throw new Error(`Product ID ${item.product_id} not found.`);

      let unit_price = product.offer_price_lkr ?? product.normal_price_lkr;
      let item_code = product.item_code;
      let variant_snapshot: Record<string, string> | null = null;
      let imageUrl = product.images[0]?.thumbnail_url || product.images[0]?.image_url || '';

      if (item.variant_id) {
        const variant = product.variants.find((v) => v.id === item.variant_id);
        if (variant) {
          item_code = variant.sku || item_code;
          variant_snapshot = variant.combination;
          if (variant.price_override_lkr !== null && variant.price_override_lkr !== undefined) {
            unit_price = variant.price_override_lkr;
          }
          if (variant.image_url) {
            imageUrl = variant.image_url;
          }
        }
      }

      const line_total = Math.round(unit_price * item.qty);
      subtotal_lkr += line_total;

      validated_items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: product.id,
        variant_id: item.variant_id,
        product_name_snapshot: product.name,
        item_code_snapshot: item_code,
        variant_snapshot,
        qty: item.qty,
        unit_price_lkr: unit_price,
        line_total_lkr: line_total,
        product_image_snapshot: imageUrl,
      });
    }

    const delivery_fee_lkr = settings.delivery.delivery_enabled
      ? settings.delivery.islandwide_fee_lkr
      : 0;

    const total_lkr = subtotal_lkr + delivery_fee_lkr;

    return {
      subtotal_lkr,
      delivery_fee_lkr,
      total_lkr,
      validated_items,
    };
  },

  // ORDERS
  getOrders(): Order[] {
    initializeStorage();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  saveOrders(orders: Order[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  // Create pending order server/store authoritative
  createOrder(formData: CheckoutFormData, cartItems: CartItem[]): Order {
    const calc = this.calculateAuthoritativeOrder(
      cartItems.map((c) => ({
        product_id: c.product_id,
        variant_id: c.variant_id,
        qty: c.qty,
      }))
    );

    const orderNumber = generateOrderNumber();
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name: formData.customer_name.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      district: formData.district,
      note: formData.note?.trim() || null,
      subtotal_lkr: calc.subtotal_lkr,
      delivery_fee_lkr: calc.delivery_fee_lkr,
      total_lkr: calc.total_lkr,
      status: 'pending',
      payment_method: 'bank_transfer',
      payment_status: 'pending',
      payment_confirmed_at: null,
      payment_reference: null,
      waybill_number: null,
      courier_name: null,
      tracking_url: null,
      cancel_reason: null,
      is_demo: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: calc.validated_items,
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  },

  // Confirm Order atomically: verifies stock, decrements stock once, marks bank transfer payment as verified
  confirmOrder(orderId: string, paymentRef?: string): { success: boolean; error?: string; order?: Order } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, error: 'Order not found' };

    const order = orders[orderIndex];
    if (order.status === 'confirmed' && order.payment_status === 'paid') {
      return { success: false, error: 'Order payment is already verified and confirmed' };
    }
    if (order.status === 'cancelled') {
      return { success: false, error: 'Cannot confirm a cancelled order' };
    }

    // Atomic Stock Decrement Check if transitioning from pending
    if (order.status !== 'confirmed') {
      const products = this.getProducts();
      for (const item of order.items) {
        if (item.product_id) {
          const prod = products.find((p) => p.id === item.product_id);
          if (prod) {
            if (item.variant_id) {
              const v = prod.variants.find((vr) => vr.id === item.variant_id);
              if (v && v.stock < item.qty) {
                return {
                  success: false,
                  error: `Insufficient stock for variant ${item.item_code_snapshot} (Available: ${v.stock})`,
                };
              }
            } else if (prod.stock < item.qty) {
              return {
                success: false,
                error: `Insufficient stock for ${prod.name} (Available: ${prod.stock})`,
              };
            }
          }
        }
      }

      // Decrement stock
      for (const item of order.items) {
        if (item.product_id) {
          const prod = products.find((p) => p.id === item.product_id);
          if (prod) {
            if (item.variant_id) {
              const v = prod.variants.find((vr) => vr.id === item.variant_id);
              if (v) v.stock = Math.max(0, v.stock - item.qty);
            }
            prod.stock = Math.max(0, prod.stock - item.qty);
          }
        }
      }
      this.saveProducts(products);
    }

    const nowIso = new Date().toISOString();
    const generatedWaybill =
      order.waybill_number ||
      `VLR-${order.order_number.replace(/[^0-9]/g, '').slice(-8) || Math.floor(10000000 + Math.random() * 90000000)}`;

    const updatedOrder: Order = {
      ...order,
      status: 'confirmed',
      payment_status: 'paid',
      payment_confirmed_at: order.payment_confirmed_at || nowIso,
      payment_reference: paymentRef || order.payment_reference || `BT-${Date.now().toString().slice(-6)}`,
      confirmed_at: order.confirmed_at || nowIso,
      waybill_number: generatedWaybill,
      courier_name: order.courier_name || 'Islandwide Express Logistics',
      tracking_url: order.tracking_url || `https://track.velora.lk/waybill/${generatedWaybill}`,
      updated_at: nowIso,
    };

    orders[orderIndex] = updatedOrder;
    this.saveOrders(orders);
    return { success: true, order: updatedOrder };
  },

  // Cancel Order safely
  cancelOrder(orderId: string, reason?: string): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, error: 'Order not found' };

    const order = orders[orderIndex];
    if (order.status === 'cancelled') {
      return { success: false, error: 'Order is already cancelled' };
    }

    orders[orderIndex] = {
      ...order,
      status: 'cancelled',
      cancel_reason: reason || null,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.saveOrders(orders);
    return { success: true };
  },

  // Update Waybill
  updateWaybill(
    orderId: string,
    waybill: { waybill_number?: string | null; courier_name?: string | null; tracking_url?: string | null }
  ): boolean {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return false;

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...waybill,
      updated_at: new Date().toISOString(),
    };
    this.saveOrders(orders);
    return true;
  },

  // Seed Demo Products
  seedDemoProducts(): number {
    const existing = this.getProducts();
    // Keep real products
    const realProducts = existing.filter((p) => !p.is_demo);
    const combined = [...realProducts, ...DEMO_PRODUCTS];
    this.saveProducts(combined);
    return DEMO_PRODUCTS.length;
  },

  // Reset Demo Data: MUST DELETE ONLY is_demo = true records!
  resetDemoData(confirmationPhrase: string): { success: boolean; deletedCount: number; error?: string } {
    if (confirmationPhrase !== 'RESET') {
      return { success: false, deletedCount: 0, error: 'Confirmation phrase must be RESET' };
    }

    const products = this.getProducts();
    const realProducts = products.filter((p) => !p.is_demo);
    const deletedCount = products.length - realProducts.length;
    this.saveProducts(realProducts);

    // Clean up demo orders too
    const orders = this.getOrders();
    const realOrders = orders.filter((o) => !o.is_demo);
    this.saveOrders(realOrders);

    return { success: true, deletedCount };
  },

  resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEMO_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEMO_PRODUCTS));
  },

  updateOrderStatus(orderId: string, newStatus: OrderStatus): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    if (newStatus === 'confirmed') {
      const res = this.confirmOrder(orderId);
      if (!res.success && res.error) {
        throw new Error(res.error);
      }
      return this.getOrders()[index];
    }

    if (newStatus === 'cancelled') {
      this.cancelOrder(orderId);
      return this.getOrders()[index];
    }

    orders[index] = {
      ...orders[index],
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    this.saveOrders(orders);
    return orders[index];
  },
};
