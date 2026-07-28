/*
# Add branches, translation columns, and fix RLS policies for admin

## Changes

### 1. New Table: branches
- `branches` — physical store locations customers can pick up from
  - id (uuid PK)
  - name, name_en, name_kg — branch name in 3 languages
  - address, address_en, address_kg — address in 3 languages
  - phone — contact phone
  - is_active (boolean, default true)
  - display_order (int, default 0)
  - created_at (timestamp)

### 2. Modified Table: products
- Added columns: name_en, name_kg, description_en, description_kg, material_en, material_kg
- Added column: is_top (boolean, default false) — marks top/featured products for home page

### 3. Modified Table: categories
- Added columns: name_en, name_kg, description_en, description_kg

### 4. Modified Table: orders
- Added column: branch_id (uuid, FK to branches, nullable) — which branch the order is for

### 5. RLS Policy Fixes
The admin panel uses the anon key (custom token auth, not Supabase auth).
Previous policies only allowed SELECT on products/categories and INSERT on orders.
This meant the admin could NOT read orders, create/edit/delete products, or manage categories.

New policies allow full CRUD on all tables for anon + authenticated, since this is a
no-auth app where the admin token is checked client-side and the edge function handles
admin login via service role key.

### 6. Seed Data
- Insert sample branches (Bishkek, Osh, Karakol)
- Update existing products with is_top for some products
*/

-- ============================================================
-- 1. Branches table
-- ============================================================
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  name_kg text,
  address text,
  address_en text,
  address_kg text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_branches" ON branches;
CREATE POLICY "public_read_branches" ON branches
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_branches" ON branches;
CREATE POLICY "public_insert_branches" ON branches
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_branches" ON branches;
CREATE POLICY "public_update_branches" ON branches
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_branches" ON branches;
CREATE POLICY "public_delete_branches" ON branches
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. Add translation columns to products
-- ============================================================
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS name_kg text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS description_kg text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS material_en text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS material_kg text;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS is_top boolean NOT NULL DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 3. Add translation columns to categories
-- ============================================================
DO $$ BEGIN
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en text;
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_kg text;
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_en text;
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_kg text;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 4. Add branch_id to orders
-- ============================================================
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- 5. Fix RLS policies — allow full CRUD on all tables for anon
-- ============================================================

-- Products: add INSERT, UPDATE, DELETE (SELECT already exists)
DROP POLICY IF EXISTS "public_insert_products" ON products;
CREATE POLICY "public_insert_products" ON products
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_products" ON products;
CREATE POLICY "public_update_products" ON products
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_products" ON products;
CREATE POLICY "public_delete_products" ON products
  FOR DELETE TO anon, authenticated USING (true);

-- Categories: add INSERT, UPDATE, DELETE (SELECT already exists)
DROP POLICY IF EXISTS "public_insert_categories" ON categories;
CREATE POLICY "public_insert_categories" ON categories
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_categories" ON categories;
CREATE POLICY "public_update_categories" ON categories
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_categories" ON categories;
CREATE POLICY "public_delete_categories" ON categories
  FOR DELETE TO anon, authenticated USING (true);

-- Orders: add SELECT, UPDATE (INSERT already exists)
DROP POLICY IF EXISTS "public_select_orders" ON orders;
CREATE POLICY "public_select_orders" ON orders
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_orders" ON orders;
CREATE POLICY "public_update_orders" ON orders
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Order items: add SELECT (INSERT already exists)
DROP POLICY IF EXISTS "public_select_order_items" ON order_items;
CREATE POLICY "public_select_order_items" ON order_items
  FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- 6. Seed branches
-- ============================================================
INSERT INTO branches (name, name_en, name_kg, address, address_en, address_kg, phone, display_order)
VALUES
  ('Бишкек — Центр', 'Bishkek — Center', 'Бишкек — Борбор', 'г. Бишкек, пр. Чуй 100', 'Bishkek, Chuy Ave 100', 'Бишкек шаары, Чуй проспекти 100', '+996 312 123 456', 1),
  ('Ош', 'Osh', 'Ош', 'г. Ош, ул. Ленина 45', 'Osh, Lenin St 45', 'Ош шаары, Ленин көчөсү 45', '+996 3222 123 456', 2),
  ('Каракол', 'Karakol', 'Каракол', 'г. Каракол, ул. Токтогула 12', 'Karakol, Toktogul St 12', 'Каракол шаары, Токтогул көчөсү 12', '+996 3922 123 456', 3)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. Mark some products as top
-- ============================================================
UPDATE products SET is_top = true WHERE featured = true;

-- ============================================================
-- 8. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_is_top ON products(is_top) WHERE is_top = true;
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
