/*
  # Create wish_food and test_eat tables

  1. New Tables
    - `food_wishes`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references profiles)
      - `dish_name` (text) - Name of wished dish
      - `description` (text, nullable) - Additional comments
      - `likes_count` (integer) - Number of likes from chefs
      - `status` (text) - 'pending', 'fulfilled', 'archived'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `food_wish_likes`
      - `id` (uuid, primary key)
      - `wish_id` (uuid, references food_wishes)
      - `chef_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `food_wish_comments`
      - `id` (uuid, primary key)
      - `wish_id` (uuid, references food_wishes)
      - `user_id` (uuid, references profiles)
      - `comment_text` (text)
      - `created_at` (timestamptz)

    - `test_eat_products`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `chef_id` (uuid, references profiles)
      - `test_price` (decimal)
      - `total_spots` (integer)
      - `spots_remaining` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to create wishes
    - Add policies for chefs to like and comment
    - Add policies for chefs to create test products
    - Add policies for customers to view and book test spots
*/

-- Create food_wishes table
CREATE TABLE IF NOT EXISTS food_wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dish_name text NOT NULL,
  description text,
  likes_count integer DEFAULT 0 NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create food_wish_likes table
CREATE TABLE IF NOT EXISTS food_wish_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid REFERENCES food_wishes(id) ON DELETE CASCADE NOT NULL,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(wish_id, chef_id)
);

-- Create food_wish_comments table
CREATE TABLE IF NOT EXISTS food_wish_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wish_id uuid REFERENCES food_wishes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create test_eat_products table
CREATE TABLE IF NOT EXISTS test_eat_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  test_price decimal(10,2) NOT NULL,
  total_spots integer NOT NULL,
  spots_remaining integer NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE food_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_wish_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_wish_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_eat_products ENABLE ROW LEVEL SECURITY;

-- Policies for food_wishes
CREATE POLICY "Anyone can view active food wishes"
  ON food_wishes FOR SELECT
  TO authenticated
  USING (status = 'pending');

CREATE POLICY "Authenticated users can create wishes"
  ON food_wishes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own wishes"
  ON food_wishes FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all wishes"
  ON food_wishes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies for food_wish_likes
CREATE POLICY "Anyone can view wish likes"
  ON food_wish_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Chefs can like wishes"
  ON food_wish_likes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = chef_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'seller'
    )
  );

CREATE POLICY "Chefs can unlike wishes"
  ON food_wish_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

-- Policies for food_wish_comments
CREATE POLICY "Anyone can view comments"
  ON food_wish_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON food_wish_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON food_wish_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON food_wish_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies for test_eat_products
CREATE POLICY "Anyone can view active test products"
  ON test_eat_products FOR SELECT
  TO authenticated
  USING (active = true AND spots_remaining > 0);

CREATE POLICY "Chefs can create test products"
  ON test_eat_products FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = chef_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'seller'
    )
  );

CREATE POLICY "Chefs can update own test products"
  ON test_eat_products FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Admins can manage all test products"
  ON test_eat_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_food_wishes_customer ON food_wishes(customer_id);
CREATE INDEX IF NOT EXISTS idx_food_wishes_status ON food_wishes(status);
CREATE INDEX IF NOT EXISTS idx_food_wish_likes_wish ON food_wish_likes(wish_id);
CREATE INDEX IF NOT EXISTS idx_food_wish_comments_wish ON food_wish_comments(wish_id);
CREATE INDEX IF NOT EXISTS idx_test_eat_products_chef ON test_eat_products(chef_id);
CREATE INDEX IF NOT EXISTS idx_test_eat_products_active ON test_eat_products(active);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_wish_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE food_wishes
    SET likes_count = likes_count + 1
    WHERE id = NEW.wish_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE food_wishes
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.wish_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wish_likes_count
AFTER INSERT OR DELETE ON food_wish_likes
FOR EACH ROW
EXECUTE FUNCTION update_wish_likes_count();