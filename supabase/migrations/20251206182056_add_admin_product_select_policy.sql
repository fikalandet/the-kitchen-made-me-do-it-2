/*
  # Add admin SELECT policy for products

  1. Changes
    - Add RLS policy allowing admins to view all products regardless of status
    
  2. Security
    - Policy checks that user has role='admin' OR is_admin=true
    - Allows admins to view paused/inactive products in admin panel
*/

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );
