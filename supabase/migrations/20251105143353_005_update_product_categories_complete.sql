/*
  # Update Product Categories - Complete List

  1. Updates to Enums
    - Update `food_type` with complete list (15 types including Barnmat, Brunch, etc.)
    - Update `main_ingredient` with categorized ingredients (Animalistiskt protein, Vegetabiliskt protein, Kolhydratbas, Övrigt baslivsmedel)
    - Update `cooking_method` with complete list (21 methods)
    - Update `food_preference` with complete list (21 preferences)

  2. Changes
    - Drop old enum types and recreate with new values
    - Allow multiple selections for main ingredients (array instead of single value)
    - Maintain backward compatibility where possible

  3. Notes
    - All categories support multiple selections to match customer filtering needs
    - Categories organized by logical groupings for better UX
*/

-- Drop old enums and recreate with new values
DROP TYPE IF EXISTS food_type CASCADE;
CREATE TYPE food_type AS ENUM (
  'frukost',
  'lunch',
  'middag',
  'efterratt',
  'mellanmal',
  'barnmat',
  'brunch',
  'festmat',
  'husmanskost',
  'picknick',
  'romantisk_middag',
  'street_food',
  'studentmat',
  'halsokak',
  'ata_i_bilen'
);

DROP TYPE IF EXISTS main_ingredient_category CASCADE;
CREATE TYPE main_ingredient_category AS ENUM (
  'fagel',
  'fisk',
  'flaskap',
  'notkott',
  'kyckling',
  'lamm',
  'skaldjur',
  'vilt',
  'agg',
  'bonor',
  'fron',
  'kikartor',
  'linser',
  'notter',
  'quinoa',
  'tofu',
  'tempeh',
  'soja',
  'quorn',
  'brod',
  'bulgur',
  'couscous',
  'havregron',
  'nudlar',
  'pasta',
  'potatis',
  'ris',
  'polenta',
  'bar',
  'frukt',
  'gradde',
  'gronsaker',
  'mjolk',
  'ost',
  'svamp',
  'yoghurt'
);

DROP TYPE IF EXISTS cooking_method CASCADE;
CREATE TYPE cooking_method AS ENUM (
  'bakning',
  'bbq',
  'fermentering',
  'friterad',
  'grillad',
  'halstrad',
  'inlagd',
  'kokt',
  'marinerad',
  'picklad',
  'ragout',
  'rokt',
  'rostad',
  'saltad',
  'sous_vide',
  'stekt',
  'stuvad',
  'ugn',
  'wok',
  'angkokt'
);

DROP TYPE IF EXISTS food_preference CASCADE;
CREATE TYPE food_preference AS ENUM (
  'alkalisk',
  'paleo',
  'ekologisk',
  'familjevanlig',
  'glutenfri',
  'halal',
  'histaminfri',
  'keto',
  'kosher',
  'laktosfri',
  'lchf',
  'majsfri',
  'mjolkproteinfri',
  'narproducerat',
  'notfri',
  'rawfood',
  'sockerfri',
  'sojafri',
  'vegansk',
  'vegetarisk',
  'aggfri'
);

-- Update products table columns
DO $$
BEGIN
  -- Drop old main_ingredient column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'main_ingredient'
  ) THEN
    ALTER TABLE products DROP COLUMN main_ingredient;
  END IF;

  -- Add main_ingredients as array to allow multiple selections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'main_ingredients'
  ) THEN
    ALTER TABLE products ADD COLUMN main_ingredients main_ingredient_category[];
  END IF;

  -- Drop and recreate food_type column with new enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_type'
  ) THEN
    ALTER TABLE products DROP COLUMN food_type;
  END IF;
  ALTER TABLE products ADD COLUMN food_type food_type;

  -- Drop and recreate cooking_method column with new enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cooking_method'
  ) THEN
    ALTER TABLE products DROP COLUMN cooking_method;
  END IF;
  ALTER TABLE products ADD COLUMN cooking_method cooking_method;

  -- Drop and recreate food_preferences column with new enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_preferences'
  ) THEN
    ALTER TABLE products DROP COLUMN food_preferences;
  END IF;
  ALTER TABLE products ADD COLUMN food_preferences food_preference[];

  -- Add cooking_methods array to allow multiple cooking methods
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cooking_methods'
  ) THEN
    ALTER TABLE products ADD COLUMN cooking_methods cooking_method[];
  END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_products_food_type;
DROP INDEX IF EXISTS idx_products_main_ingredient;
DROP INDEX IF EXISTS idx_products_cooking_method;
DROP INDEX IF EXISTS idx_products_food_preferences;

CREATE INDEX idx_products_food_type ON products(food_type);
CREATE INDEX idx_products_main_ingredients ON products USING GIN(main_ingredients);
CREATE INDEX idx_products_cooking_method ON products(cooking_method);
CREATE INDEX idx_products_cooking_methods ON products USING GIN(cooking_methods);
CREATE INDEX idx_products_food_preferences ON products USING GIN(food_preferences);
