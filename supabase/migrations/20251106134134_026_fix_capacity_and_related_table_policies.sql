/*
  # Fix Public Access to Capacity and Related Tables

  1. Security Changes
    - Update meal_box_capacity_periods to allow public read access
    - Update other related tables that need public visibility
    - Keep write operations restricted to authenticated sellers
  
  2. Rationale
    - Anonymous users need to see capacity info when browsing marketplace
    - Capacity information is public data that helps users make purchasing decisions
    
  3. Tables Affected
    - meal_box_capacity_periods
    - meal_box_dishes
    - accessories
    - product_accessories
    - catering_bookings
    - product_visibility
    - meal_box_templates
*/

-- Update meal_box_capacity_periods policies
DROP POLICY IF EXISTS "Sellers can view capacity for their meal boxes" ON meal_box_capacity_periods;
DROP POLICY IF EXISTS "Anyone can view capacity periods" ON meal_box_capacity_periods;

CREATE POLICY "Public can view active capacity periods"
  ON meal_box_capacity_periods FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Update meal_box_dishes policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'meal_box_dishes'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view meal box dishes" ON meal_box_dishes';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view meal box dishes" ON meal_box_dishes';
  END IF;
END $$;

CREATE POLICY "Public can view meal box dishes"
  ON meal_box_dishes FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_dishes.meal_box_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

-- Update accessories policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'accessories'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view accessories" ON accessories';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view accessories" ON accessories';
  END IF;
END $$;

CREATE POLICY "Public can view all accessories"
  ON accessories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update catering_bookings policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'catering_bookings'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Sellers can view their bookings" ON catering_bookings';
    EXECUTE 'DROP POLICY IF EXISTS "Buyers can view their bookings" ON catering_bookings';
  END IF;
END $$;

-- Sellers can view their own bookings
CREATE POLICY "Sellers can view own catering bookings"
  ON catering_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = catering_bookings.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Customers can view their own bookings
CREATE POLICY "Customers can view own catering bookings"
  ON catering_bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Update product_visibility policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_visibility'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view product visibility" ON product_visibility';
  END IF;
END $$;

CREATE POLICY "Public can view product visibility settings"
  ON product_visibility FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_visibility.product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

-- Update meal_box_templates policies (these should be public as templates)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'meal_box_templates'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view meal box templates" ON meal_box_templates';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view templates" ON meal_box_templates';
  END IF;
END $$;

CREATE POLICY "Public can view active meal box templates"
  ON meal_box_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
