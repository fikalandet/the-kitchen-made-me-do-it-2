/*
  # Update product fields for dish improvements

  1. Changes
    - Drop old single-value fields (preparation_time_minutes, portions, category, product_category, cuisine_type)
    - Add pricing fields for different portion sizes (price_small, price_standard, price_large, price_package)
    - Add accessories field for sides/add-ons
    - Convert allergens from text to array
    - Convert cuisine_type to cuisine_types array for multiple selections
    - Update food_type enum to include 'gryta', 'soppa' and change 'barnmat' to 'barnvanligt'

  2. Notes
    - Allows multiple portion sizes with different pricing
    - Supports multiple cuisine type selections
    - Standardized allergen selection
*/

-- Update food_type enum with new values
ALTER TYPE food_type ADD VALUE IF NOT EXISTS 'gryta';
ALTER TYPE food_type ADD VALUE IF NOT EXISTS 'soppa';
ALTER TYPE food_type ADD VALUE IF NOT EXISTS 'barnvanligt';

-- Drop old fields
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'preparation_time_minutes') THEN
    ALTER TABLE products DROP COLUMN preparation_time_minutes;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'portions') THEN
    ALTER TABLE products DROP COLUMN portions;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
    ALTER TABLE products DROP COLUMN category;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_category') THEN
    ALTER TABLE products DROP COLUMN product_category;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cuisine_type') THEN
    ALTER TABLE products DROP COLUMN cuisine_type;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'city') THEN
    ALTER TABLE products DROP COLUMN city;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'postal_code') THEN
    ALTER TABLE products DROP COLUMN postal_code;
  END IF;
END $$;

-- Create cuisine type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cuisine_type') THEN
    CREATE TYPE cuisine_type AS ENUM (
      'svensk',
      'italiensk',
      'fransk',
      'asiatisk',
      'kinesisk',
      'japansk',
      'thailandsk',
      'indisk',
      'mellanostern',
      'mexikansk',
      'spansk',
      'grekisk',
      'amerikansk',
      'fusion'
    );
  END IF;
END $$;

-- Add new fields
DO $$
BEGIN
  -- Pricing fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_small') THEN
    ALTER TABLE products ADD COLUMN price_small decimal(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_standard') THEN
    ALTER TABLE products ADD COLUMN price_standard decimal(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_large') THEN
    ALTER TABLE products ADD COLUMN price_large decimal(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_package') THEN
    ALTER TABLE products ADD COLUMN price_package decimal(10,2);
  END IF;

  -- Accessories field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'accessories') THEN
    ALTER TABLE products ADD COLUMN accessories text;
  END IF;

  -- Cuisine types array
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cuisine_types') THEN
    ALTER TABLE products ADD COLUMN cuisine_types cuisine_type[];
  END IF;
END $$;

-- Update allergens to be an array if it's text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'allergens' 
    AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE products ALTER COLUMN allergens TYPE text[] USING 
      CASE 
        WHEN allergens IS NULL THEN NULL 
        ELSE string_to_array(allergens, ',')
      END;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_cuisine_types ON products USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_products_allergens ON products USING GIN(allergens);
