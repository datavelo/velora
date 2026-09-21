export type District =
  | 'Ampara'
  | 'Anuradhapura'
  | 'Badulla'
  | 'Batticaloa'
  | 'Colombo'
  | 'Galle'
  | 'Gampaha'
  | 'Hambantota'
  | 'Jaffna'
  | 'Kalutara'
  | 'Kandy'
  | 'Kegalle'
  | 'Kilinochchi'
  | 'Kurunegala'
  | 'Mannar'
  | 'Matale'
  | 'Matara'
  | 'Monaragala'
  | 'Mullaitivu'
  | 'Nuwara Eliya'
  | 'Polonnaruwa'
  | 'Puttalam'
  | 'Ratnapura'
  | 'Trincomalee'
  | 'Vavuniya';

export const SRI_LANKAN_DISTRICTS: District[] = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string | null;
  subcategories?: Category[];
}

export interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductOptionValue {
  id?: string;
  option_id?: string;
  value: string;
  sort_order: number;
}

export interface ProductOption {
  id?: string;
  product_id?: string;
  name: string; // e.g. "Color", "Size", "Frame Material", "Volume"
  sort_order: number;
  values: ProductOptionValue[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  combination: Record<string, string>; // e.g. {"Color": "Black", "Size": "M"}
  stock: number;
  price_override_lkr?: number | null;
  image_url?: string | null;
  is_active: boolean;
}

export interface ProductAttribute {
  id?: string;
  product_id?: string;
  name: string;
  value: string;
  is_filterable: boolean;
}

export type CustomAttribute = ProductAttribute;

export interface Product {
  id: string;
  name: string;
  slug: string;
  item_code: string; // SKU
  brand: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  category?: Category;
  subcategory?: Category;
  description?: string | null;
  item_details?: string | null;
  normal_price_lkr: number; // Integer LKR
  offer_price_lkr?: number | null; // Integer LKR
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_demo: boolean;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  cart_item_id: string; // unique identifier for cart line: `${product_id}-${variant_id || 'default'}`
  product_id: string;
  product: Product;
  variant_id?: string | null;
  variant?: ProductVariant | null;
  selected_options: Record<string, string>;
  qty: number;
  unit_price_lkr: number; // calculated authoritative unit price (offer price or variant price override)
  line_total_lkr: number;
}

export interface CheckoutFormData {
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  district: District;
  note?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface OrderItemSnapshot {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name_snapshot: string;
  item_code_snapshot: string;
  variant_snapshot?: Record<string, string> | null;
  qty: number;
  unit_price_lkr: number;
  line_total_lkr: number;
  product_image_snapshot?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  district: string;
  note?: string | null;
  subtotal_lkr: number;
  delivery_fee_lkr: number;
  total_lkr: number;
  status: OrderStatus;
  payment_method: 'bank_transfer';
  payment_status: 'pending' | 'paid';
  payment_confirmed_at?: string | null;
  payment_reference?: string | null;
  waybill_number?: string | null;
  courier_name?: string | null;
  tracking_url?: string | null;
  cancel_reason?: string | null;
  is_demo: boolean;
  created_at: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  updated_at: string;
  items: OrderItemSnapshot[];
}

export interface BankTransferDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  instructions?: string;
}

export interface SiteSettings {
  general: {
    brand_name: string;
    tagline: string;
    whatsapp: string;
    whatsapp_display: string;
    email: string;
    facebook_url: string;
    instagram_url: string;
    currency: string;
    currency_symbol: string;
    logo_url: string;
  };
  bank_transfer: BankTransferDetails;
  delivery: {
    islandwide_fee_lkr: number;
    delivery_enabled: boolean;
    free_delivery_threshold_lkr: number;
    estimated_days: string;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    image_desktop: string;
    image_mobile: string;
  };
}
