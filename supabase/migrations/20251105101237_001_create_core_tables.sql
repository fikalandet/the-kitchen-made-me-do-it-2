/*
  # Core Tables for Food Marketplace Platform

  1. New Tables
    - `profiles` - User profiles for buyers, sellers (chefs), and admins
    - `membership_levels` - Membership tiers (free, silver, gold) with commission rates
    - `products` - All product types (individual dishes, meal boxes, subscriptions, etc)
    - `product_types` - Enum for product categories
    - `orders` - Customer orders/purchases
    - `order_items` - Individual items within orders
    - `gold_points` - Gold points earned and spent
    - `messages` - Messaging between users
    
  2. Security
    - Enable RLS on all tables
    - Policies for buyers, sellers, and admins
*/

-- Product type enum
CREATE TYPE product_type AS ENUM (
  'dish',
  'meal_box',
  'subscription',
  'diy_kit',
  'hire_chef',
  'catering',
  'recipe',
  'video'
);

-- Membership level enum
CREATE TYPE membership_level AS ENUM ('free', 'silver', 'gold');

-- User role enum
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  display_name text,
  avatar_url text,
  bio text,
  membership_level membership_level DEFAULT 'free',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membership levels with commission rates
CREATE TABLE IF NOT EXISTS membership_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level membership_level UNIQUE NOT NULL,
  commission_percentage numeric(5,2) NOT NULL,
  features jsonb DEFAULT '{}',
  max_products integer,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type product_type NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category text,
  ingredients text[],
  allergens text[],
  is_boosted boolean DEFAULT false,
  boost_expires_at timestamptz,
  featured_on_homepage boolean DEFAULT false,
  available boolean DEFAULT true,
  preparation_time_minutes integer,
  portions integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  payment_method text,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  delivery_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Gold points table
CREATE TABLE IF NOT EXISTS gold_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  transaction_type text NOT NULL,
  related_order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  awarded_by_seller_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Insert default membership levels
INSERT INTO membership_levels (level, commission_percentage, features, max_products) VALUES
  ('free', 15.0, '{"can_sell": true, "messaging": true}', 10),
  ('silver', 10.0, '{"can_sell": true, "messaging": true, "boost": true, "can_award_points": true}', 50),
  ('gold', 5.0, '{"can_sell": true, "messaging": true, "boost": true, "can_award_points": true, "advanced_analytics": true}', null)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Sellers can view all seller profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'seller' OR auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  TO authenticated
  USING (available = true);

CREATE POLICY "Sellers can view their own products"
  ON products FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Admins can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Order items policies
CREATE POLICY "Users can view items in their orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- Gold points policies
CREATE POLICY "Users can view their own points"
  ON gold_points FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can insert gold points"
  ON gold_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());
