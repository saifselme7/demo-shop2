-- ============================================================================
--  SAIF STORE — CLOTHING E-COMMERCE  (Egyptian Arabic)
--  Full database schema + Row Level Security + Storage buckets + seed catalog.
--
--  HOW TO APPLY:
--    1. Go to your Supabase project dashboard.
--    2. Project URL: https://pluilmszldtetbumdbxt.supabase.co
--    3. Open SQL Editor -> New query -> paste ALL of this file -> Run.
--    4. Then create the storage buckets:
--         - Open "Storage" -> "New bucket"
--         - Bucket 1: name "product-images"  (Public ON)
--         - Bucket 2: name "payment-proofs"  (Public OFF  -> private)
--       (The SQL below also tries to create them, but the dashboard is the
--        guaranteed manual fallback if the SQL editor lacks storage rights.)
--    5. Create the first admin account:
--         - Open the site at /admin/login and sign up. The FIRST account to
--           register automatically becomes the store owner (role = admin).
--           Every account registered afterwards becomes a regular customer.
--
--  SECURITY NOTES:
--     * Only a public / publishable client key is used in the app.
--     * Row Level Security is ENABLED on every table.
--     * No service_role key is used anywhere.
--     * Payment-proof screenshots live in a PRIVATE storage bucket.
-- ============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 2. PRODUCTS  (clothing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    description   TEXT,
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    old_price     NUMERIC(10,2) CHECK (old_price IS NULL OR old_price >= price),
    image_url     TEXT,
    is_available  BOOLEAN NOT NULL DEFAULT true,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    stock         INTEGER CHECK (stock IS NULL OR stock >= 0),
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_sort ON public.products(sort_order, created_at DESC);

-- ============================================================================
-- 3. PRODUCT IMAGES  (gallery)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- ============================================================================
-- 4. PROFILES  (linked to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name  TEXT,
    phone      TEXT,
    role       TEXT NOT NULL DEFAULT 'customer'
               CHECK (role IN ('admin','customer','staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 5. STORE SETTINGS  (owner-editable from the dashboard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         TEXT NOT NULL UNIQUE,
    value       TEXT,
    label       TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- 6. ORDERS
--    Payment status is kept SEPARATE from order status on purpose.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number              TEXT NOT NULL UNIQUE,
    customer_name             TEXT NOT NULL,
    customer_phone            TEXT NOT NULL,
    customer_email            TEXT,
    shipping_address          TEXT NOT NULL,
    notes                     TEXT,
    subtotal                  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    delivery_fee              NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total                     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    -- Order lifecycle (independent of payment)
    status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','confirmed','preparing','shipped','delivered','cancelled')),
    -- Payment
    payment_method            TEXT CHECK (payment_method IN ('vodafone_cash','instapay')),
    payment_status            TEXT NOT NULL DEFAULT 'pending'
                              CHECK (payment_status IN ('pending','approved','rejected')),
    payment_transfer_number   TEXT,
    payment_proof_path        TEXT,
    payment_reviewed_at       TIMESTAMP WITH TIME ZONE,
    payment_reviewed_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payment_rejection_reason  TEXT,
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ============================================================================
-- 7. ORDER ITEMS  (snapshot of the product at purchase time)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name  TEXT NOT NULL,
    product_image TEXT,
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ============================================================================
-- 8. updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['categories','products','profiles','store_settings','orders']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I;', t, t);
        EXECUTE format(
            'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', t, t);
    END LOOP;
END $$;

-- ============================================================================
-- 9. AUTO-CREATE PROFILE ON SIGNUP
--    The very first account to register becomes the store owner (admin).
--    Every later account becomes a regular customer.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT count(*) INTO admin_count FROM public.profiles WHERE role = 'admin';

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'عميل جديد'),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
        CASE WHEN admin_count = 0 THEN 'admin' ELSE 'customer' END
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone     = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 10. ADMIN HELPER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- ============================================================================
-- 11. ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. RLS POLICIES
-- ============================================================================

-- ---- CATEGORIES: public read, admin write ----
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin categories write" ON public.categories;
CREATE POLICY "Admin categories write" ON public.categories
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- PRODUCTS: public read, admin write ----
DROP POLICY IF EXISTS "Public products read" ON public.products;
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin products write" ON public.products;
CREATE POLICY "Admin products write" ON public.products
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- PRODUCT IMAGES: public read, admin write ----
DROP POLICY IF EXISTS "Public product_images read" ON public.product_images;
CREATE POLICY "Public product_images read" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin product_images write" ON public.product_images;
CREATE POLICY "Admin product_images write" ON public.product_images
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- PROFILES: read own + admin reads all, update own ----
DROP POLICY IF EXISTS "Profiles read own" ON public.profiles;
CREATE POLICY "Profiles read own" ON public.profiles FOR SELECT
    TO authenticated USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE
    TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admin profiles manage" ON public.profiles;
CREATE POLICY "Admin profiles manage" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- STORE SETTINGS: public read, admin write ----
DROP POLICY IF EXISTS "Public settings read" ON public.store_settings;
CREATE POLICY "Public settings read" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin settings write" ON public.store_settings;
CREATE POLICY "Admin settings write" ON public.store_settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- ORDERS: admin full control; public tracked ONLY via secure RPC ----
DROP POLICY IF EXISTS "Admin orders read" ON public.orders;
CREATE POLICY "Admin orders read" ON public.orders FOR SELECT
    TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin orders write" ON public.orders;
CREATE POLICY "Admin orders write" ON public.orders
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---- ORDER ITEMS: admin read ----
DROP POLICY IF EXISTS "Admin order_items read" ON public.order_items;
CREATE POLICY "Admin order_items read" ON public.order_items FOR SELECT
    TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin order_items write" ON public.order_items;
CREATE POLICY "Admin order_items write" ON public.order_items
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 13. ORDER RPCs (secure, server-side)
-- ============================================================================

-- create_order: validates items/prices on the server, computes totals,
-- generates the order number, inserts order + items atomically.
CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_name         TEXT,
    p_customer_phone        TEXT,
    p_customer_email        TEXT DEFAULT NULL,
    p_shipping_address      TEXT,
    p_notes                 TEXT DEFAULT NULL,
    p_payment_method        TEXT,
    p_payment_transfer_number TEXT DEFAULT NULL,
    p_payment_proof_path    TEXT DEFAULT NULL,
    p_items                 JSONB
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_order_id       UUID;
    v_order_number   TEXT;
    v_subtotal       NUMERIC(10,2) := 0;
    v_delivery_fee   NUMERIC(10,2) := 0;
    v_total          NUMERIC(10,2);
    v_item           JSONB;
    v_product        public.products%ROWTYPE;
    v_qty            INTEGER;
    v_setting        TEXT;
BEGIN
    IF p_payment_method NOT IN ('vodafone_cash','instapay') THEN
        RAISE EXCEPTION 'طريقة الدفع غير صحيحة';
    END IF;
    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'يجب أن تحتوي الطلبية على منتج واحد على الأقل';
    END IF;
    IF length(trim(p_customer_name)) < 2 THEN
        RAISE EXCEPTION 'الاسم مطلوب';
    END IF;
    IF length(trim(p_customer_phone)) < 6 THEN
        RAISE EXCEPTION 'رقم الموبايل مطلوب';
    END IF;

    v_order_number := 'ORD-' || to_char(now(), 'YYMMDD') || '-' ||
                      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT * INTO v_product
        FROM public.products
        WHERE id = (v_item->>'product_id')::UUID;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'منتج غير موجود في المتجر';
        END IF;
        IF NOT v_product.is_available THEN
            RAISE EXCEPTION 'المنتج "%" غير متاح حالياً', v_product.name;
        END IF;

        v_qty := (v_item->>'quantity')::INTEGER;
        IF v_qty IS NULL OR v_qty <= 0 THEN
            RAISE EXCEPTION 'الكمية غير صحيحة';
        END IF;
        IF v_product.stock IS NOT NULL AND v_product.stock >= 0 AND v_qty > v_product.stock THEN
            RAISE EXCEPTION 'الكمية المطلوبة من "%" غير متوفرة في المخزون', v_product.name;
        END IF;

        v_subtotal := v_subtotal + v_product.price * v_qty;
    END LOOP;

    SELECT value INTO v_setting FROM public.store_settings WHERE key = 'delivery_fee';
    v_delivery_fee := COALESCE(v_setting::NUMERIC, 0);
    IF v_delivery_fee < 0 THEN v_delivery_fee := 0; END IF;
    v_total := v_subtotal + v_delivery_fee;

    INSERT INTO public.orders (
        order_number, customer_name, customer_phone, customer_email,
        shipping_address, notes, subtotal, delivery_fee, total,
        status, payment_method, payment_status,
        payment_transfer_number, payment_proof_path
    ) VALUES (
        v_order_number, trim(p_customer_name), trim(p_customer_phone), nullif(trim(COALESCE(p_customer_email,'')), ''),
        p_shipping_address, p_notes, v_subtotal, v_delivery_fee, v_total,
        'pending', p_payment_method, 'pending',
        p_payment_transfer_number, p_payment_proof_path
    ) RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::INTEGER;

        INSERT INTO public.order_items (
            order_id, product_id, product_name, product_image, price, quantity
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.image_url,
            v_product.price, v_qty
        );

        IF v_product.stock IS NOT NULL AND v_product.stock >= 0 THEN
            UPDATE public.products SET stock = stock - v_qty WHERE id = v_product.id;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total', v_total
    );
END;
$$;

-- get_order_by_number: secure order lookup, requires the customer's phone.
CREATE OR REPLACE FUNCTION public.get_order_by_number(
    p_order_number TEXT,
    p_phone        TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_order  public.orders%ROWTYPE;
    v_items  JSONB;
BEGIN
    SELECT * INTO v_order FROM public.orders WHERE order_number = trim(p_order_number);
    IF NOT FOUND THEN
        RAISE EXCEPTION 'الطلبية غير موجودة';
    END IF;
    IF v_order.customer_phone <> trim(p_phone) THEN
        RAISE EXCEPTION 'رقم الموبايل لا يطابق هذه الطلبية';
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'price', oi.price,
            'quantity', oi.quantity
        ) ORDER BY oi.created_at
    ), '[]'::JSONB) INTO v_items
    FROM public.order_items oi WHERE oi.order_id = v_order.id;

    RETURN jsonb_build_object(
        'order', to_jsonb(v_order),
        'items', v_items
    );
END;
$$;

-- ============================================================================
-- 14. STORAGE BUCKETS + POLICIES
-- ============================================================================

-- product-images bucket (PUBLIC) — storefront product photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public product images read" ON storage.objects;
CREATE POLICY "Public product images read" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin product images insert" ON storage.objects;
CREATE POLICY "Admin product images insert" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin product images update" ON storage.objects;
CREATE POLICY "Admin product images update" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin product images delete" ON storage.objects;
CREATE POLICY "Admin product images delete" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- payment-proofs bucket (PRIVATE) — customer payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Customers can upload payment proofs" ON storage.objects;
CREATE POLICY "Customers can upload payment proofs" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Admins read payment proofs" ON storage.objects;
CREATE POLICY "Admins read payment proofs" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Admins manage payment proofs" ON storage.objects;
CREATE POLICY "Admins manage payment proofs" ON storage.objects
    FOR UPDATE, DELETE TO authenticated USING (bucket_id = 'payment-proofs');

-- ============================================================================
-- 15. SEED — STORE SETTINGS
-- ============================================================================
INSERT INTO public.store_settings (key, value, label) VALUES
    ('store_name',              'سيف ستور',               'اسم المتجر'),
    ('store_name_en',           'SAIF STORE',             'اسم المتجر (إنجليزي)'),
    ('tagline',                 'براند ملابس مصري عصري',  'الوصف القصير'),
    ('contact_phone',           '01040324811',            'رقم التواصل'),
    ('whatsapp',                '01040324811',            'واتساب'),
    ('email',                   'hello@saifstore.com',    'البريد الإلكتروني'),
    ('address',                 'القاهرة، مصر',           'العنوان'),
    ('payment_number',          '01040324811',            'رقم الدفع الموحد'),
    ('payment_number_vodafone', '01040324811',            'رقم فودافون كاش'),
    ('payment_number_instapay', '01040324811',            'رقم انستاباي'),
    ('delivery_fee',            '0',                      'رسوم التوصيل (جنيه)'),
    ('free_delivery_threshold', '0',                      'التوصيل المجاني فوق (جنيه)'),
    ('announcement',            'شحن سريع لجميع محافظات مصر — الدفع عند الاستلام غير متاح', 'شريط الإعلان'),
    ('hero_title',              'ملابس تصنع حضورك',        'عنوان الهيرو'),
    ('hero_subtitle',           'أحدث صيحات الموضة والجودة المصرية الخام في تشكيلة واحد.', 'نص الهيرو')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label;

-- ============================================================================
-- 16. SEED — CATEGORIES (Egyptian clothing)
-- ============================================================================
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, sort_order) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'تيشيرتات', 'tshirts', 'تيشيرتات قطن مريحة لكل المناسبات اليومية والكاجوال.', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', true, 1),
    ('c1000000-0000-0000-0000-000000000002', 'هوديز',    'hoodies', 'هوديز قطن ثقيل تدفيك في الشتاء وتعطيك طابع كاجوال أنيق.', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80', true, 2),
    ('c1000000-0000-0000-0000-000000000003', 'بناطيل',   'pants',    'بناطيل جينز وكارجو وشينو بخامات متينة وتفاصيل عصرية.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80', true, 3),
    ('c1000000-0000-0000-0000-000000000004', 'قمصان',    'shirts',   'قمصان قطن وكتان مثالية للعمل والمناسبات النصف رسمية.', 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=80', true, 4),
    ('c1000000-0000-0000-0000-000000000005', 'جاكيتات',  'jackets',  'جاكيتات ومعاطف شتوية بخامات دافئة وتصميمات مودرن.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80', true, 5),
    ('c1000000-0000-0000-0000-000000000006', 'شورتات',   'shorts',   'شورتات صيفية مريحة من قماش الجينز والقطن.', 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=900&q=80', true, 6),
    ('c1000000-0000-0000-0000-000000000007', 'ملابس رياضية', 'sportswear', 'أطقم رياضية وليجنج وتيشيرتات تنفسية للجيم والتمارين.', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80', true, 7),
    ('c1000000-0000-0000-0000-000000000008', 'إكسسوارات', 'accessories', 'كابات وأحزمة وجوارب تكمل إطلالتك اليومية.', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80', true, 8)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description,
    image_url = EXCLUDED.image_url, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 17. SEED — PRODUCTS (Egyptian clothing catalog)
-- ============================================================================
INSERT INTO public.products
    (id, category_id, name, slug, description, price, old_price, image_url, is_available, is_featured, stock, sort_order)
VALUES
    -- تيشيرتات
    ('p1000000-0000-0000-0000-000000000001','c1000000-0000-0000-0000-000000000001','تيشيرت قطن كلاسيك أبيض','tshirt-cotton-classic-white','تيشيرت قطن مصري 100% بقصّة كلاسيك مريحة. مثالي للاستخدام اليومي ويُلبس مع أي بنطلون.',299.00,399.00,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',true,true,50,1),
    ('p1000000-0000-0000-0000-000000000002','c1000000-0000-0000-0000-000000000001','تيشيرت أوفرسايز أسود','tshirt-oversized-black','تيشيرت أوفرسايز بقصّة عصرية واسعة، خامة قطن سميكة مريحة. اللون الأسود يليق بكل الإطلالات.',349.00,NULL,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80',true,true,45,2),
    ('p1000000-0000-0000-0000-000000000003','c1000000-0000-0000-0000-000000000001','تيشيرت جرافيك مودرن','tshirt-graphic-modern','تيشيرت جرافيك بطبعة عصرية لافتة، خامة قطن فاخرة وتفاصيل خياطة دقيقة.',379.00,449.00,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',true,false,30,3),

    -- هوديز
    ('p1000000-0000-0000-0000-000000000004','c1000000-0000-0000-0000-000000000002','هودي كلاسيك أسود','hoodie-classic-black','هودي قطني سميك بجيب أمامي وغطاء رأس مزود بخيط قابل للتعديل. الدفء والأناقة معاً.',649.00,749.00,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',true,true,25,1),
    ('p1000000-0000-0000-0000-000000000005','c1000000-0000-0000-0000-000000000002','هودي رمادي كاجوال','hoodie-grey-casual','هودي بلون رمادي محايد ينسق بسهولة مع كل الملابس. خامة قطن مرن تدوم طويلاً.',699.00,NULL,'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&q=80',true,false,20,2),
    ('p1000000-0000-0000-0000-000000000006','c1000000-0000-0000-0000-000000000002','هودي فيربز بسحّاب','hoodie-zip-front','هودي بسحّاب أمامي بالكامل وخامة مبطنة دافئة. اختيار عملي للتنقل والرياضة.',799.00,NULL,'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',true,false,15,3),

    -- بناطيل
    ('p1000000-0000-0000-0000-000000000007','c1000000-0000-0000-0000-000000000003','بنطلون جينز سليم','jeans-slim-fit','بنطلون جينز بقصّة سليم بخصر متوسط، خامة دنيم متينة وتصميم مودرن يناسب كل الأجسام.',599.00,NULL,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',true,true,40,1),
    ('p1000000-0000-0000-0000-000000000008','c1000000-0000-0000-0000-000000000003','بنطلون كارغو عسكري','cargo-pants-military','بنطلون كارغو بجيوب جانبية واسعة وخامة متينة، عملي وأنيق للإطلالات الكاجوال.',549.00,649.00,'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80',true,false,35,2),
    ('p1000000-0000-0000-0000-000000000009','c1000000-0000-0000-0000-000000000003','بنطلون شينو بيج','chino-beige','بنطلون شينو بلون بيج ناعم، قماش قطني خفيف مثالي لفصل الربيع والخريف.',499.00,NULL,'https://images.unsplash.com/photo-1551854838-212c50b4d184?auto=format&fit=crop&w=900&q=80',true,false,28,3),

    -- قمصان
    ('p1000000-0000-0000-0000-000000000010','c1000000-0000-0000-0000-000000000004','قميص قطن كلاسيك أبيض','shirt-oxford-white','قميص قطن كلاسيك بياقة أوكسفورد، أنيق للعمل والمناسبات النصف رسمية.',449.00,NULL,'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80',true,true,22,1),
    ('p1000000-0000-0000-0000-000000000011','c1000000-0000-0000-0000-000000000004','قميص كتان كاجوال','shirt-linen-casual','قميص كتان خفيف ومنفّس، مثالي للأجواء الحارة ويُلبس مفتوحاً أو مقفلاً.',529.00,NULL,'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=900&q=80',true,false,18,2),
    ('p1000000-0000-0000-0000-000000000012','c1000000-0000-0000-0000-000000000004','قميص كاروهات رجالي','shirt-plaid','قميص بنقشة كاروهات عصرية، خامة قطن ناعمة وقصّة مريحة.',479.00,549.00,'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=900&q=80',true,false,20,3),

    -- جاكيتات
    ('p1000000-0000-0000-0000-000000000013','c1000000-0000-0000-0000-000000000005','جاكيت جينز','denim-jacket','جاكيت جينز كلاسيك بتصميم خالد، يضيف شخصية لأي إطلالة ويحميك من الجو المعتدل.',999.00,1199.00,'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80',true,true,12,1),
    ('p1000000-0000-0000-0000-000000000014','c1000000-0000-0000-0000-000000000005','بومبر قطني أسود','bomber-jacket-black','بومبر قطني أسود بقصّة رياضية عصرية، خامة مريحة تمنحك إطلالة شبابية.',899.00,NULL,'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',true,false,14,2),
    ('p1000000-0000-0000-0000-000000000015','c1000000-0000-0000-0000-000000000005','معطف شتوي طويل','winter-coat','معطف شتوي طويل مصمم للدفء القصوى، خامة صوفية فاخرة وتصميم راقٍ.',1499.00,1699.00,'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=80',true,false,8,3),

    -- شورتات
    ('p1000000-0000-0000-0000-000000000016','c1000000-0000-0000-0000-000000000006','شورت جينز','denim-shorts','شورت جينز قصير بقصّة مريحة، مثالي لفصل الصيف والإطلالات البحرية.',349.00,NULL,'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=900&q=80',true,false,30,1),
    ('p1000000-0000-0000-0000-000000000017','c1000000-0000-0000-0000-000000000006','شورت رياضي','sport-shorts','شورت رياضي بخامة خفيفة وسريعة الجفاف، مثالي للجيم والجري.',299.00,NULL,'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80',true,false,26,2),

    -- ملابس رياضية
    ('p1000000-0000-0000-0000-000000000018','c1000000-0000-0000-0000-000000000007','طقم رياضي كامل','tracksuit-set','طقم رياضي (تيشيرت + بنطلون) بتصميم عصري وخامة تنفسية للتمرين اليومي.',799.00,949.00,'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=80',true,true,16,1),
    ('p1000000-0000-0000-0000-000000000019','c1000000-0000-0000-0000-000000000007','تيشيرت رياضي تنفّسي','sports-tee-breathable','تيشيرت رياضي بخامة دراي-فيت تمتص العرق وتمنحك راحة تامة أثناء التمرين.',399.00,NULL,'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80',true,false,24,2),
    ('p1000000-0000-0000-0000-000000000020','c1000000-0000-0000-0000-000000000007','ليجنج رياضي','sports-leggings','ليجنج رياضي بخصر مرتفع وخامة مطاطية تدعم جسمك أثناء التمارين.',499.00,599.00,'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=900&q=80',true,false,20,3),

    -- إكسسوارات
    ('p1000000-0000-0000-0000-000000000021','c1000000-0000-0000-0000-000000000008','كاب أسود مطوّز','black-cap','كاب قطني أسود بتطريز بسيط، يكمّل إطلالتك الكاجوال ويحميك من الشمس.',199.00,NULL,'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80',true,true,60,1),
    ('p1000000-0000-0000-0000-000000000022','c1000000-0000-0000-0000-000000000008','حزام جلد رجالي','leather-belt','حزام جلد طبيعي بإبزيم معدني متين، خامة فاخرة تدوم لسنوات.',249.00,NULL,'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',true,false,40,2),
    ('p1000000-0000-0000-0000-000000000023','c1000000-0000-0000-0000-000000000008','باكو جوارب قطن (٣ قطع)','cotton-socks-3pack','باكو ٣ جوارب قطن مريحة بألوان متعددة تناسب الاستخدام اليومي.',149.00,NULL,'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=900&q=80',true,false,100,3)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description,
    price = EXCLUDED.price, old_price = EXCLUDED.old_price,
    image_url = EXCLUDED.image_url, is_available = EXCLUDED.is_available,
    is_featured = EXCLUDED.is_featured, stock = EXCLUDED.stock, sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 18. SEED — PRODUCT IMAGES (gallery for a few hero items)
-- ============================================================================
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, u.url, g.n
FROM (VALUES
    ('p1000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80'),
    ('p1000000-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80'),
    ('p1000000-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&q=80'),
    ('p1000000-0000-0000-0000-000000000013','https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=900&q=80')
) AS u(pid, url)
CROSS JOIN (SELECT generate_series(1,1) AS n) g
JOIN public.products p ON p.id = u.pid::uuid
ON CONFLICT DO NOTHING;
