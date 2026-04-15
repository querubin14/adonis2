-- SCHEMA FOR ADONIS JEWELRY
-- Paste this into the Supabase SQL Editor (https://supabase.com/dashboard/project/womaohrhidudmpuawwag/sql)

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price BIGINT NOT NULL DEFAULT 0, -- Price in Gs. (using bigint for large values)
  material TEXT,
  description TEXT,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  phone TEXT,
  shipping_address TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Public Read Access)
CREATE POLICY "Allow public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for products" ON products FOR SELECT USING (true);

-- 6. Create Policies (Admin/Service Role only for writes - standard for simple setups)
-- Note: Replace with specific auth roles if you implement Auth
CREATE POLICY "Allow service role full access" ON categories USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON products USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert for orders" ON orders FOR INSERT WITH CHECK (true);
