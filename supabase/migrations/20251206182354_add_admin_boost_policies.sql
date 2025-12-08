/*
  # Add admin policies for boost tables

  1. Changes
    - Add INSERT policies allowing admins to create boost orders for any chef
    - Add INSERT policies allowing admins to create boost reservations for any chef
    - Add INSERT policies allowing admins to create boost products for any chef
    
  2. Security
    - Policies check that user has role='admin' OR is_admin=true
    - Allows admins to create boosts on behalf of chefs from admin panel
*/

-- Allow admins to create boost orders for any chef
CREATE POLICY "Admins can create orders for any chef"
  ON boost_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Allow admins to create boost reservations for any chef
CREATE POLICY "Admins can create reservations for any chef"
  ON boost_reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Check if boost_products table exists and add policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'boost_products'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can create boost products for any chef"
      ON boost_products FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = ''admin'' OR profiles.is_admin = true)
        )
      )';
  END IF;
END $$;
