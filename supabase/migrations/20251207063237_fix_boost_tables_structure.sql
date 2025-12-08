/*
  # Fixa boost-tabellernas struktur

  1. Ändringar i boost_orders
    - Lägg till kolumnen `currency` (text, default 'SEK')
    - Lägg till kolumnen `membership_level_at_purchase` (text, nullable)
    - Ändra kolumnen `payment_status` till `status` för att matcha koden
    - Gör `reservation_id` nullable eftersom order skapas före reservation

  2. Ny tabell boost_products
    - `id` (uuid, primary key)
    - `type` (text) - Produkttyp (dish, meal_box, etc)
    - `ref_id` (uuid) - Referens till produkten
    - `chef_id` (uuid) - Referens till kocken
    - `created_at` (timestamptz)

  3. Ändringar i boost_reservations
    - Lägg till kolumnen `order_id` (uuid) - Referens till boost_orders
    - Lägg till kolumnen `product_id` som referens till boost_products (inte products)
    - Ta bort NOT NULL från befintlig product_id först

  4. Säkerhet
    - RLS aktiverad på boost_products
    - Policies för läsning och skrivning
*/

-- 1. Uppdatera boost_orders
DO $$
BEGIN
  -- Lägg till currency kolumn om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE boost_orders ADD COLUMN currency text DEFAULT 'SEK';
  END IF;

  -- Lägg till membership_level_at_purchase om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_orders' AND column_name = 'membership_level_at_purchase'
  ) THEN
    ALTER TABLE boost_orders ADD COLUMN membership_level_at_purchase text;
  END IF;

  -- Byt namn på payment_status till status om payment_status finns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_orders' AND column_name = 'payment_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE boost_orders RENAME COLUMN payment_status TO status;
  END IF;

  -- Gör reservation_id nullable
  ALTER TABLE boost_orders ALTER COLUMN reservation_id DROP NOT NULL;
END $$;

-- 2. Skapa boost_products tabell
CREATE TABLE IF NOT EXISTS boost_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  ref_id uuid NOT NULL,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Aktivera RLS på boost_products
ALTER TABLE boost_products ENABLE ROW LEVEL SECURITY;

-- Policies för boost_products
CREATE POLICY "Chefs can view own boost products"
  ON boost_products FOR SELECT
  TO authenticated
  USING (chef_id = auth.uid());

CREATE POLICY "Chefs can create boost products"
  ON boost_products FOR INSERT
  TO authenticated
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Admins can view all boost products"
  ON boost_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

CREATE POLICY "Admins can create boost products for any chef"
  ON boost_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- 3. Uppdatera boost_reservations
DO $$
BEGIN
  -- Lägg till order_id om den inte finns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_reservations' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE boost_reservations ADD COLUMN order_id uuid REFERENCES boost_orders(id) ON DELETE CASCADE;
  END IF;

  -- Gör den gamla product_id nullable (den pekar nu på products-tabellen, vi lägger till en ny för boost_products)
  ALTER TABLE boost_reservations ALTER COLUMN product_id DROP NOT NULL;
  
  -- Lägg till boost_product_id som referens till boost_products
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'boost_reservations' AND column_name = 'boost_product_id'
  ) THEN
    ALTER TABLE boost_reservations ADD COLUMN boost_product_id uuid REFERENCES boost_products(id) ON DELETE CASCADE;
  END IF;
END $$;
