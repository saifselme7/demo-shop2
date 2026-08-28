-- ==========================================================
-- SAIF STORE - FULL DATABASE SCHEMA & RLS SETUP
-- Execute this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- ==========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'customer', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Trigger to automatically create a profile when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Store Admin'),
        'admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Categories
DROP POLICY IF EXISTS "Public categories read access" ON public.categories;
CREATE POLICY "Public categories read access"
    ON public.categories
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins category insert" ON public.categories;
CREATE POLICY "Admins category insert"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins category update" ON public.categories;
CREATE POLICY "Admins category update"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins category delete" ON public.categories;
CREATE POLICY "Admins category delete"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (true);

-- 9. RLS Policies for Products
DROP POLICY IF EXISTS "Public products read access" ON public.products;
CREATE POLICY "Public products read access"
    ON public.products
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins product insert" ON public.products;
CREATE POLICY "Admins product insert"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins product update" ON public.products;
CREATE POLICY "Admins product update"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins product delete" ON public.products;
CREATE POLICY "Admins product delete"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- 10. RLS Policies for Profiles
DROP POLICY IF EXISTS "Authenticated users view profiles" ON public.profiles;
CREATE POLICY "Authenticated users view profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 11. Storage Bucket Creation & Storage RLS Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public bucket image access" ON storage.objects;
CREATE POLICY "Public bucket image access"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated bucket image upload" ON storage.objects;
CREATE POLICY "Authenticated bucket image upload"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated bucket image update" ON storage.objects;
CREATE POLICY "Authenticated bucket image update"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated bucket image delete" ON storage.objects;
CREATE POLICY "Authenticated bucket image delete"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images');

-- 12. Seed Starter Categories
INSERT INTO public.categories (id, name, slug, description, image_url)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Coffee & Espresso', 'coffee-espresso', 'Artisan hot and cold specialty coffees crafted with premium beans.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'),
    ('c2222222-2222-2222-2222-222222222222', 'Burgers & Sandwiches', 'burgers-sandwiches', 'Gourmet smashed beef burgers and artisanal toasted brioche sandwiches.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'),
    ('c3333333-3333-3333-3333-333333333333', 'Desserts & Sweets', 'desserts-sweets', 'Freshly baked pastries, cheesecakes, and delightful sweet treats.', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'),
    ('c4444444-4444-4444-4444-444444444444', 'Cold Beverages', 'cold-beverages', 'Refreshing iced teas, mojitos, and natural fruit blends.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- 13. Seed Starter Products
INSERT INTO public.products (id, category_id, name, slug, description, price, image_url, is_available)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Italian Caffè Latte', 'italian-caffe-latte', 'Freshly brewed espresso with steamed velvety whole milk and a light silky microfoam.', 100.00, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80', true),
    ('p2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Spanish Iced Latte', 'spanish-iced-latte', 'Rich double espresso over sweet condensed milk, ice, and chilled fresh milk.', 125.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80', true),
    ('p3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Caramel Macchiato', 'caramel-macchiato', 'Steamed milk with vanilla-flavored syrup, marked with espresso and drizzled with caramel.', 115.00, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80', true),
    ('p4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Double Truffle Smash Burger', 'double-truffle-smash-burger', 'Two juicy smashed Black Angus patties, Swiss cheese, caramelized onions, and black truffle mayo.', 240.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80', true),
    ('p5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Crispy Buttermilk Chicken Burger', 'crispy-buttermilk-chicken-burger', 'Crispy golden fried chicken breast, honey mustard slaw, dill pickles on a brioche bun.', 195.00, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80', true),
    ('p6666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 'San Sebastian Burnt Cheesecake', 'san-sebastian-burnt-cheesecake', 'Creamy Basque cheesecake with a caramelized burnt crust and warm Belgian chocolate sauce.', 145.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', true),
    ('p7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Nutella Molten Lava Cake', 'nutella-molten-lava-cake', 'Warm dark chocolate cake with a molten Nutella center, served with vanilla bean gelato.', 130.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', true),
    ('p8888888-8888-8888-8888-8888-888888888888', 'c4444444-4444-4444-4444-444444444444', 'Passion Fruit Mojito', 'passion-fruit-mojito', 'Zesty fresh lime, crushed garden mint, passion fruit puree, and sparkling club soda.', 95.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url;
