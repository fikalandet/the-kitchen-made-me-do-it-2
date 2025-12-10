/*
  # Add Smaketiketter (Taste Tags) Section
  
  1. Updates
    - Add "Smaketiketter" section to site_sections table
  
  2. New Tables
    - `taste_label_dishes`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key) - Reference to the product/dish
      - `taste_label_text` (text) - The flavor tag text written by chef
      - `is_boosted` (boolean) - Whether this dish is boosted in the flow
      - `is_removed_by_admin` (boolean) - Soft delete by admin
      - `removed_by_admin_id` (uuid, nullable) - Admin who removed it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Security
    - Enable RLS on `taste_label_dishes` table
    - Chefs can insert/update/delete their own taste label dishes
    - Admins can update is_removed_by_admin and is_boosted
    - Public can read non-removed taste label dishes
*/

-- Add Smaketiketter section to site_sections if not exists
INSERT INTO site_sections (name, slug, settings, design, order_index, visible)
VALUES (
  'Smaketiketter',
  'smaketiketter',
  '{
    "heading": "Smaketiketter",
    "headingFont": "lobster",
    "headingFontSize": 32,
    "headingColor": "#374151",
    "headingBold": false,
    "headingAlignment": "center",
    "subtitleTexts": ["Kockar delar sina personliga favoriter"],
    "subtitleRotationInterval": 10000,
    "subtitlePlacement": "inline",
    "subtitleFont": "sans",
    "subtitleFontSize": 16,
    "subtitleColor": "#6b7280",
    "subtitleBold": false,
    "subtitleItalic": false,
    "backgroundColor": "#ffffff"
  }'::jsonb,
  '{}'::jsonb,
  12,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Create taste_label_dishes table
CREATE TABLE IF NOT EXISTS taste_label_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  taste_label_text text NOT NULL,
  is_boosted boolean DEFAULT false NOT NULL,
  is_removed_by_admin boolean DEFAULT false NOT NULL,
  removed_by_admin_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE taste_label_dishes ENABLE ROW LEVEL SECURITY;

-- Policy: Chefs can create taste labels for their own products
CREATE POLICY "Chefs can create taste labels for own products"
  ON taste_label_dishes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = taste_label_dishes.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Policy: Chefs can update their own taste labels
CREATE POLICY "Chefs can update own taste labels"
  ON taste_label_dishes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = taste_label_dishes.product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = taste_label_dishes.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Policy: Chefs can delete their own taste labels
CREATE POLICY "Chefs can delete own taste labels"
  ON taste_label_dishes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = taste_label_dishes.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Policy: Admins can manage taste labels
CREATE POLICY "Admins can manage taste labels"
  ON taste_label_dishes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Public can read non-removed taste labels
CREATE POLICY "Public can read visible taste labels"
  ON taste_label_dishes
  FOR SELECT
  TO anon, authenticated
  USING (is_removed_by_admin = false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_taste_label_dishes_product_id ON taste_label_dishes(product_id);
CREATE INDEX IF NOT EXISTS idx_taste_label_dishes_boosted ON taste_label_dishes(is_boosted);
CREATE INDEX IF NOT EXISTS idx_taste_label_dishes_removed ON taste_label_dishes(is_removed_by_admin);
