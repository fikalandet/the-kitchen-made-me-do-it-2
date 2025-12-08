/*
  # Convert food_type to array for multiple selections

  1. Changes
    - Drop existing food_type column (single value)
    - Add food_types column (array) to allow multiple food type selections
    - Update indexes accordingly

  2. Notes
    - This allows products to be tagged with multiple food types
    - For example, a dish can be both "Brunch" and "Festmat"
*/

-- Drop old food_type column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_type'
  ) THEN
    ALTER TABLE products DROP COLUMN food_type;
  END IF;
END $$;

-- Add food_types as array
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_types'
  ) THEN
    ALTER TABLE products ADD COLUMN food_types food_type[];
  END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_products_food_type;
CREATE INDEX IF NOT EXISTS idx_products_food_types ON products USING GIN(food_types);
