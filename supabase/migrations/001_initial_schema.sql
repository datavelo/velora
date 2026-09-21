-- ==============================================================================
-- VELORA - OFFICIAL SUPABASE DATABASE SCHEMA MIGRATION 001
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    item_code TEXT NOT NULL, -- SKU
    brand TEXT NOT NULL DEFAULT 'VELORA',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    item_details TEXT,
    normal_price_lkr INT NOT NULL CHECK (normal_price_lkr >= 0),
    offer_price_lkr INT CHECK (offer_price_lkr IS NULL OR offer_price_lkr >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_best_seller BOOLEAN NOT NULL DEFAULT false,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(item_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);

-- 4. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    width INT,
    height INT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 5. Product Options (Dynamic: Color, Size, Frame Material, Volume, etc.)
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_options_product ON public.product_options(product_id);

-- 6. Product Option Values
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_option_values_opt ON public.product_option_values(option_id);

-- 7. Product Variants (SKU combinations with stock and optional overrides)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    combination JSONB NOT NULL, -- e.g. {"Color": "Black", "Size": "M"}
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price_override_lkr INT CHECK (price_override_lkr IS NULL OR price_override_lkr >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 8. Product Filterable Attributes (e.g. Frame Style, Lens Color, Gender, Fit, Volume)
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    is_filterable BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_product_attrs_product ON public.product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attrs_name_val ON public.product_attributes(name, value);

-- 9. Daily Order Sequence Table for Safe Race-Condition Free Order Number Generation
CREATE TABLE IF NOT EXISTS public.order_sequences (
    order_date DATE PRIMARY KEY,
    last_val INT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.get_next_order_number()
RETURNS TEXT AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    next_seq INT;
    date_str TEXT;
    formatted_num TEXT;
BEGIN
    date_str := to_char(today_date, 'YYYYMMDD');
    
    INSERT INTO public.order_sequences (order_date, last_val)
    VALUES (today_date, 1)
    ON CONFLICT (order_date)
    DO UPDATE SET last_val = public.order_sequences.last_val + 1
    RETURNING last_val INTO next_seq;
    
    formatted_num := 'VL-' || date_str || '-' || lpad(next_seq::text, 4, '0');
    RETURN formatted_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    note TEXT,
    subtotal_lkr INT NOT NULL CHECK (subtotal_lkr >= 0),
    delivery_fee_lkr INT NOT NULL CHECK (delivery_fee_lkr >= 0),
    total_lkr INT NOT NULL CHECK (total_lkr >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    waybill_number TEXT,
    courier_name TEXT,
    tracking_url TEXT,
    cancel_reason TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);

-- 11. Order Items (Snapshot based for immutable historical accuracy & invoices)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    item_code_snapshot TEXT NOT NULL,
    variant_snapshot JSONB,
    qty INT NOT NULL CHECK (qty > 0),
    unit_price_lkr INT NOT NULL CHECK (unit_price_lkr >= 0),
    line_total_lkr INT NOT NULL CHECK (line_total_lkr >= 0),
    product_image_snapshot TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 12. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Stored Procedure: Confirm Order & Atomically Decrement Stock (Prevents Double-Confirm)
CREATE OR REPLACE FUNCTION public.confirm_order(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_current_stock INT;
BEGIN
    -- Check admin privilege if called directly from client
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Lock the order row
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status = 'confirmed' THEN
        RAISE EXCEPTION 'Order is already confirmed';
    END IF;

    IF v_order.status = 'cancelled' THEN
        RAISE EXCEPTION 'Cannot confirm a cancelled order';
    END IF;

    -- Iterate and decrement stock safely
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
        IF v_item.variant_id IS NOT NULL THEN
            -- Check variant stock
            SELECT stock INTO v_current_stock FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
            IF v_current_stock < v_item.qty THEN
                RAISE EXCEPTION 'Insufficient stock for variant % (current: %, requested: %)', v_item.item_code_snapshot, v_current_stock, v_item.qty;
            END IF;
            UPDATE public.product_variants SET stock = stock - v_item.qty WHERE id = v_item.variant_id;
            -- Also decrement base product stock if applicable
            IF v_item.product_id IS NOT NULL THEN
                UPDATE public.products SET stock = GREATEST(0, stock - v_item.qty) WHERE id = v_item.product_id;
            END IF;
        ELSIF v_item.product_id IS NOT NULL THEN
            SELECT stock INTO v_current_stock FROM public.products WHERE id = v_item.product_id FOR UPDATE;
            IF v_current_stock < v_item.qty THEN
                RAISE EXCEPTION 'Insufficient stock for product % (current: %, requested: %)', v_item.product_name_snapshot, v_current_stock, v_item.qty;
            END IF;
            UPDATE public.products SET stock = stock - v_item.qty WHERE id = v_item.product_id;
        END IF;
    END LOOP;

    -- Mark confirmed
    UPDATE public.orders
    SET status = 'confirmed',
        confirmed_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'status', 'confirmed', 'order_id', p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Stored Procedure: Cancel Order
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    IF v_order.status = 'cancelled' THEN
        RAISE EXCEPTION 'Order is already cancelled';
    END IF;

    UPDATE public.orders
    SET status = 'cancelled',
        cancel_reason = p_reason,
        cancelled_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'status', 'cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Stored Procedure: Safe Reset Demo Data
CREATE OR REPLACE FUNCTION public.reset_demo_data(p_confirmation TEXT)
RETURNS JSONB AS $$
DECLARE
    v_deleted_products INT;
    v_deleted_orders INT;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_confirmation <> 'RESET' THEN
        RAISE EXCEPTION 'Confirmation phrase must be RESET';
    END IF;

    -- Delete demo orders
    WITH del_orders AS (
        DELETE FROM public.orders WHERE is_demo = true RETURNING id
    )
    SELECT count(*) INTO v_deleted_orders FROM del_orders;

    -- Delete demo products (cascades to images, options, variants, attributes)
    WITH del_prods AS (
        DELETE FROM public.products WHERE is_demo = true RETURNING id
    )
    SELECT count(*) INTO v_deleted_products FROM del_prods;

    RETURN jsonb_build_object(
        'success', true,
        'deleted_products', v_deleted_products,
        'deleted_orders', v_deleted_orders
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_sequences ENABLE ROW LEVEL SECURITY;

-- 1. admin_roles policies
CREATE POLICY "Admins can view admin_roles" ON public.admin_roles
    FOR SELECT TO authenticated USING (public.is_admin());

-- 2. categories policies: Public can read active, Admins can do all
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. products policies: Public can read active, Admins can do all
CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. product_images policies
CREATE POLICY "Public can view images of active products" ON public.product_images
    FOR SELECT TO anon, authenticated USING (
        EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.is_active = true OR public.is_admin()))
    );

CREATE POLICY "Admins can manage product images" ON public.product_images
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. product_options & values policies
CREATE POLICY "Public can view product options" ON public.product_options
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage product options" ON public.product_options
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view product option values" ON public.product_option_values
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage product option values" ON public.product_option_values
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. product_variants policies
CREATE POLICY "Public can view active product variants" ON public.product_variants
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage product variants" ON public.product_variants
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. product_attributes policies
CREATE POLICY "Public can view product attributes" ON public.product_attributes
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage product attributes" ON public.product_attributes
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. orders & order_items policies
-- Note: Customer orders are inserted authoritative by Cloudflare Worker (using service_role)
-- Authenticated admins can view and update orders
CREATE POLICY "Admins can view orders" ON public.orders
    FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view order items" ON public.order_items
    FOR SELECT TO authenticated USING (public.is_admin());

-- 9. settings policies: Public can read settings, Admins can update
CREATE POLICY "Public can view settings" ON public.settings
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update settings" ON public.settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==============================================================================
-- STORAGE BUCKET SETUP (Run in Supabase SQL editor)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('velora-media', 'velora-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for velora-media
CREATE POLICY "Public media access" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'velora-media');

-- Admin write for velora-media
CREATE POLICY "Admin media write" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'velora-media' AND public.is_admin());
CREATE POLICY "Admin media update" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'velora-media' AND public.is_admin());
CREATE POLICY "Admin media delete" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'velora-media' AND public.is_admin());
