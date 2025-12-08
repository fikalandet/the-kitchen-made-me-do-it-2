/*
  # Add freezer_portions column to products table

  1. Changes
    - Add `freezer_portions` column to `products` table (integer, nullable, default 0)
    
  2. Purpose
    - Track the number of portions available in the freezer for each product
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'freezer_portions'
  ) THEN
    ALTER TABLE products ADD COLUMN freezer_portions integer DEFAULT 0;
  END IF;
END $$;