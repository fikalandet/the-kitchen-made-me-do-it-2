/*
  # Förbättra admin product update policy

  1. Ändringar
    - Uppdatera "Admins can update any product" policy för att även kolla is_admin flag
    
  2. Säkerhet
    - Admins kan uppdatera produkter om antingen role = 'admin' ELLER is_admin = true
*/

-- Drop den gamla policyn
DROP POLICY IF EXISTS "Admins can update any product" ON products;

-- Skapa ny policy som kollar både role och is_admin
CREATE POLICY "Admins can update any product"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR is_admin = true)
    )
  );