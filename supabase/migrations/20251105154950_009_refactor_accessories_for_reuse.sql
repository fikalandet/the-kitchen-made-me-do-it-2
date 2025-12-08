/*
  # Refactor Accessories for Reusability

  1. Changes
    - Rename existing `accessories` table to `accessories_old` for backup
    - Create new `accessories` table without product_id, adding seller_id instead
    - Create `product_accessories` junction table for many-to-many relationship
    - Add quantity fields (default_quantity, max_quantity) for flexible ordering
    - Migrate existing data from old structure to new structure
    - Drop old table after migration

  2. New Tables
    - `accessories` - Reusable accessories owned by sellers
      - Removed: product_id, included_in_price
      - Added: seller_id
    - `product_accessories` - Links products to accessories with configuration
      - product_id, accessory_id, included_in_price, default_quantity, max_quantity

  3. Security
    - Enable RLS on new tables
    - Sellers can manage their own accessories
    - Anyone can view accessories for available products

  4. Notes
    - Accessories can now be reused across multiple products
    - Each product can configure whether an accessory is included or extra
    - Customers can order multiple quantities of accessories
*/

-- Rename old accessories table for backup
ALTER TABLE IF EXISTS accessories RENAME TO accessories_old;

-- Create new accessories table with seller_id instead of product_id
CREATE TABLE IF NOT EXISTS accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  ingredients text[],
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_accessories junction table
CREATE TABLE IF NOT EXISTS product_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  accessory_id uuid NOT NULL REFERENCES accessories(id) ON DELETE CASCADE,
  included_in_price boolean DEFAULT false,
  default_quantity integer DEFAULT 1,
  max_quantity integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, accessory_id)
);

-- Migrate data from old structure to new structure
DO $$
DECLARE
  old_acc RECORD;
  new_acc_id uuid;
  seller uuid;
BEGIN
  -- Check if old table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accessories_old') THEN
    FOR old_acc IN SELECT * FROM accessories_old LOOP
      -- Get seller_id from the product
      SELECT seller_id INTO seller FROM products WHERE id = old_acc.product_id;
      
      IF seller IS NOT NULL THEN
        -- Insert into new accessories table
        INSERT INTO accessories (id, seller_id, name, description, ingredients, price, created_at, updated_at)
        VALUES (old_acc.id, seller, old_acc.name, old_acc.description, old_acc.ingredients, old_acc.price, old_acc.created_at, old_acc.updated_at)
        RETURNING id INTO new_acc_id;
        
        -- Link to product in junction table
        INSERT INTO product_accessories (product_id, accessory_id, included_in_price, default_quantity, max_quantity)
        VALUES (old_acc.product_id, new_acc_id, old_acc.included_in_price, 1, 10);
      END IF;
    END LOOP;
  END IF;
END $$;

-- Drop old table
DROP TABLE IF EXISTS accessories_old CASCADE;

-- Enable RLS
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_accessories ENABLE ROW LEVEL SECURITY;

-- Accessories policies
CREATE POLICY "Sellers can view their own accessories"
  ON accessories FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Anyone can view accessories for available products"
  ON accessories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_accessories pa
      JOIN products p ON p.id = pa.product_id
      WHERE pa.accessory_id = accessories.id
      AND p.available = true
    )
  );

CREATE POLICY "Sellers can create accessories"
  ON accessories FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update their own accessories"
  ON accessories FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own accessories"
  ON accessories FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Product accessories policies
CREATE POLICY "Anyone can view product accessories for available products"
  ON product_accessories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

CREATE POLICY "Sellers can link accessories to their own products"
  ON product_accessories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM accessories
      WHERE accessories.id = accessory_id
      AND accessories.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update product accessory relationships for their products"
  ON product_accessories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete product accessory relationships for their products"
  ON product_accessories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accessories_seller_id ON accessories(seller_id);
CREATE INDEX IF NOT EXISTS idx_accessories_ingredients ON accessories USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_product_accessories_product_id ON product_accessories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_accessories_accessory_id ON product_accessories(accessory_id);
