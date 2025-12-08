/*
  # Add admin and seller product management policies

  1. Changes
    - Add DELETE policy for sellers to delete their own products
    - Add admin policies for managing all products (UPDATE and DELETE)
  
  2. Security
    - Sellers can delete their own products (seller_id = auth.uid())
    - Admins can update any product (role = 'admin')
    - Admins can delete any product (role = 'admin')
*/

-- Add DELETE policy for sellers
CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Add admin UPDATE policy
CREATE POLICY "Admins can update any product"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add admin DELETE policy
CREATE POLICY "Admins can delete any product"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );