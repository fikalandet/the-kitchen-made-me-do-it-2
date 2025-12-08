/*
  # Fix Public Access to Products and Profiles

  1. Security Changes
    - Update products table policies to allow public (anon) access to available products
    - Update profiles table policies to allow public access to seller profiles
    - Update meal_box_details policies to allow public access
    - Keep write operations restricted to authenticated users only
  
  2. Rationale
    - The marketplace needs to be viewable by non-authenticated users
    - Users should be able to browse products before creating an account
    - Only authenticated users can create/update/delete products
    
  3. Changes
    - Drop existing restrictive SELECT policies
    - Create new policies that allow both authenticated and anonymous users to read data
    - Maintain security for write operations (INSERT, UPDATE, DELETE)
*/

-- Drop existing restrictive policies on products
DROP POLICY IF EXISTS "Anyone can view available products" ON products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON products;

-- Create new public-friendly policies for products
CREATE POLICY "Public can view available products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (available = true);

CREATE POLICY "Sellers can view all their own products"
  ON products FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

-- Drop existing restrictive policies on profiles
DROP POLICY IF EXISTS "Sellers can view all seller profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new public-friendly policies for profiles
CREATE POLICY "Public can view seller profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (role = 'seller');

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Update meal_box_details policies
DROP POLICY IF EXISTS "Anyone can view meal box details for available products" ON meal_box_details;

CREATE POLICY "Public can view meal box details for available products"
  ON meal_box_details FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_details.product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

-- Update product_accessories policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_accessories' 
    AND policyname = 'Anyone can view product accessories'
  ) THEN
    DROP POLICY "Anyone can view product accessories" ON product_accessories;
  END IF;
END $$;

CREATE POLICY "Public can view product accessories"
  ON product_accessories FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_accessories.product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

-- Update subscription_details policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_details' 
    AND policyname LIKE '%can view%'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view subscription details" ON subscription_details';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view subscription details" ON subscription_details';
  END IF;
END $$;

CREATE POLICY "Public can view subscription details for available products"
  ON subscription_details FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = subscription_details.product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );
