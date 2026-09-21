-- ==============================================================================
-- VELORA - SEED DATA (CATEGORIES, SETTINGS, & DEMO PRODUCTS)
-- ==============================================================================

-- 1. Default Settings
INSERT INTO public.settings (key, value) VALUES
('general', '{
    "brand_name": "VELORA",
    "tagline": "Haute Couture & Lifestyle",
    "whatsapp": "94778005550",
    "whatsapp_display": "0778005550",
    "email": "veloraofficialsrilanka@gmail.com",
    "facebook_url": "https://www.facebook.com/share/1JVfrLeoxE/",
    "instagram_url": "https://www.instagram.com/veloraofficialsrilanka?stkn=NWEzcGlkNmJ4Y2R2",
    "currency": "LKR",
    "currency_symbol": "Rs.",
    "logo_url": "/velora-logo.svg"
}'::jsonb),
('delivery', '{
    "islandwide_fee_lkr": 500,
    "delivery_enabled": true,
    "free_delivery_threshold_lkr": 0,
    "estimated_days": "2-4 Business Days"
}'::jsonb),
('announcement', '{
    "enabled": true,
    "text": "ISLANDWIDE EXPRESS DELIVERY AVAILABLE • 100% AUTHENTIC QUALITY GUARANTEED",
    "link": ""
}'::jsonb),
('hero', '{
    "title": "DEFINING MODERN LUXURY",
    "subtitle": "Discover Velora Haute Couture, Designer Eyewear & Artisanal Fragrances",
    "cta_text": "EXPLORE NEW ARRIVALS",
    "cta_link": "/category/women",
    "image_desktop": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    "image_mobile": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Root Categories & Subcategories
DO $$
DECLARE
    v_women_id UUID;
    v_men_id UUID;
    v_acc_id UUID;
    v_cosm_id UUID;
    v_sun_id UUID;
    v_perf_id UUID;
    v_kids_id UUID;
    v_jewel_id UUID;
    v_home_id UUID;
    v_watch_id UUID;
    v_ess_id UUID;
    v_bras_id UUID;
    v_shape_id UUID;
    v_swim_id UUID;
    v_bath_id UUID;
BEGIN
    -- WOMEN
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('WOMEN', 'women', 1, true, true, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_women_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('T-shirts', 'women-t-shirts', v_women_id, 1),
    ('Polos', 'women-polos', v_women_id, 2),
    ('Crop tops', 'women-crop-tops', v_women_id, 3),
    ('Sports Bras', 'women-sports-bras', v_women_id, 4),
    ('Tanks', 'women-tanks', v_women_id, 5),
    ('Leggings', 'women-leggings', v_women_id, 6),
    ('Skirts', 'women-skirts', v_women_id, 7),
    ('Shorts', 'women-shorts', v_women_id, 8),
    ('Hoodies & Jackets', 'women-hoodies-jackets', v_women_id, 9),
    ('Jeans', 'women-jeans', v_women_id, 10),
    ('Joggers & Pants', 'women-joggers-pants', v_women_id, 11)
    ON CONFLICT (slug) DO NOTHING;

    -- MEN
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('MEN', 'men', 2, true, true, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_men_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('T-shirts', 'men-t-shirts', v_men_id, 1),
    ('Shirts', 'men-shirts', v_men_id, 2),
    ('Polos', 'men-polos', v_men_id, 3),
    ('Shorts', 'men-shorts', v_men_id, 4),
    ('Tanks', 'men-tanks', v_men_id, 5),
    ('Compressions', 'men-compressions', v_men_id, 6),
    ('Hoodies & Jackets', 'men-hoodies-jackets', v_men_id, 7),
    ('Jeans', 'men-jeans', v_men_id, 8),
    ('Joggers & Pants', 'men-joggers-pants', v_men_id, 9),
    ('Underwear', 'men-underwear', v_men_id, 10)
    ON CONFLICT (slug) DO NOTHING;

    -- ACCESSORIES
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('ACCESSORIES', 'accessories', 3, true, true, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_acc_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('Hats & Caps', 'hats-caps', v_acc_id, 1),
    ('Shoes', 'shoes', v_acc_id, 2),
    ('Slides', 'slides', v_acc_id, 3),
    ('Jewellery', 'accessories-jewellery', v_acc_id, 4),
    ('Socks', 'socks', v_acc_id, 5),
    ('Bottles & Tumblers', 'bottles-tumblers', v_acc_id, 6),
    ('Bags', 'bags', v_acc_id, 7),
    ('Merch', 'merch', v_acc_id, 8)
    ON CONFLICT (slug) DO NOTHING;

    -- COSMETICS
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('COSMETICS', 'cosmetics', 4, true, true, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_cosm_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('Face Care', 'face-care', v_cosm_id, 1),
    ('Body Care', 'body-care', v_cosm_id, 2),
    ('Hair Care', 'hair-care', v_cosm_id, 3),
    ('Toiletries', 'toiletries', v_cosm_id, 4),
    ('Makeup', 'makeup', v_cosm_id, 5),
    ('Men Care', 'cosmetics-men', v_cosm_id, 6),
    ('Mother & Baby Care', 'mother-baby-care', v_cosm_id, 7)
    ON CONFLICT (slug) DO NOTHING;

    -- SUNGLASSES
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('SUNGLASSES', 'sunglasses', 5, true, true, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_sun_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('For Him', 'sunglasses-for-him', v_sun_id, 1),
    ('For Her', 'sunglasses-for-her', v_sun_id, 2),
    ('Unisex', 'sunglasses-unisex', v_sun_id, 3),
    ('Kids', 'sunglasses-kids', v_sun_id, 4),
    ('For Lovers', 'sunglasses-lovers', v_sun_id, 5),
    ('For Smart Mothers', 'sunglasses-smart-mothers', v_sun_id, 6)
    ON CONFLICT (slug) DO NOTHING;

    -- PERFUMES
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('PERFUMES', 'perfumes', 6, true, true, 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_perf_id;

    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
    ('For Men', 'perfumes-men', v_perf_id, 1),
    ('For Women', 'perfumes-women', v_perf_id, 2),
    ('Perfume Gift Sets', 'perfume-gift-sets', v_perf_id, 3)
    ON CONFLICT (slug) DO NOTHING;

    -- KIDS & BABY
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('KIDS & BABY', 'kids-baby', 7, true, false, 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO NOTHING;

    -- JEWELLERY
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('JEWELLERY', 'jewellery', 8, true, true, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO NOTHING;

    -- HOME
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('HOME', 'home', 9, true, false, 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO NOTHING;

    -- WATCHES
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('WATCHES', 'watches', 10, true, true, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO NOTHING;

    -- ESSENTIALS
    INSERT INTO public.categories (name, slug, sort_order, is_active, is_featured, image_url)
    VALUES ('ESSENTIALS', 'essentials', 11, true, false, 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop')
    ON CONFLICT (slug) DO NOTHING;
END $$;
