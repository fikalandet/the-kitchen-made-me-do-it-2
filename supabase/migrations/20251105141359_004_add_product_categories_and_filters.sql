/*
  # Add Product Categories and Filter Options

  1. New Enums
    - `food_type` - Types of food (Frukost, Lunch, Middag, etc.)
    - `main_ingredient` - Main ingredient categories
    - `cooking_method` - Cooking methods (Grillat, Stekt, etc.)
    - `food_preference` - Dietary preferences (Vegansk, Glutenfri, etc.)
    - `cuisine_type` - Cuisine cultures (Italiensk, Asiatisk, etc.)
    - `product_category` - Product categories (På spisen nu, Från frysen, etc.)

  2. Changes to Products Table
    - Add food_type field
    - Add main_ingredient field
    - Add cooking_method field
    - Add food_preferences array
    - Add cuisine_type field
    - Add product_category field
    - Add location_lat and location_lon for distance filtering

  3. Notes
    - All new fields are optional to maintain backward compatibility
    - Arrays allow multiple selections where applicable
*/

-- Create food type enum
DO $$ BEGIN
  CREATE TYPE food_type AS ENUM (
    'frukost',
    'lunch',
    'middag',
    'mellanmal',
    'dessert',
    'fika'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create main ingredient enum
DO $$ BEGIN
  CREATE TYPE main_ingredient AS ENUM (
    'kyckling',
    'notkott',
    'flaskap',
    'lamm',
    'fisk',
    'skaldjur',
    'vegetariskt',
    'baljvaxter',
    'pasta',
    'ris',
    'potatis',
    'agg'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create cooking method enum
DO $$ BEGIN
  CREATE TYPE cooking_method AS ENUM (
    'grillat',
    'stekt',
    'kokt',
    'bakat',
    'wokat',
    'gratinerat',
    'rakat',
    'confiterat',
    'soteat',
    'friterat',
    'angkokt'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create food preference enum
DO $$ BEGIN
  CREATE TYPE food_preference AS ENUM (
    'vegansk',
    'vegetarisk',
    'glutenfri',
    'laktosfri',
    'mjolkfri',
    'agg_fri',
    'notfri',
    'halal',
    'kosher',
    'lchf',
    'keto',
    'paleo',
    'ekologisk'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create cuisine type enum
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create product category enum
DO $$ BEGIN
  CREATE TYPE product_category AS ENUM (
    'pa_spisen_nu',
    'fran_frysen',
    'matladekas',
    'laga_sjalv_kit',
    'brattomkak',
    'testkaka'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to products table
DO $$
BEGIN
  -- Add food_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_type'
  ) THEN
    ALTER TABLE products ADD COLUMN food_type food_type;
  END IF;

  -- Add main_ingredient if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'main_ingredient'
  ) THEN
    ALTER TABLE products ADD COLUMN main_ingredient main_ingredient;
  END IF;

  -- Add cooking_method if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cooking_method'
  ) THEN
    ALTER TABLE products ADD COLUMN cooking_method cooking_method;
  END IF;

  -- Add food_preferences array if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'food_preferences'
  ) THEN
    ALTER TABLE products ADD COLUMN food_preferences food_preference[];
  END IF;

  -- Add cuisine_type if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cuisine_type'
  ) THEN
    ALTER TABLE products ADD COLUMN cuisine_type cuisine_type;
  END IF;

  -- Add product_category if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'product_category'
  ) THEN
    ALTER TABLE products ADD COLUMN product_category product_category;
  END IF;

  -- Add location coordinates for distance filtering
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'location_lat'
  ) THEN
    ALTER TABLE products ADD COLUMN location_lat numeric(10,8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'location_lon'
  ) THEN
    ALTER TABLE products ADD COLUMN location_lon numeric(11,8);
  END IF;

  -- Add city and postal_code for location display
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'city'
  ) THEN
    ALTER TABLE products ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE products ADD COLUMN postal_code text;
  END IF;
END $$;

-- Create indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_products_food_type ON products(food_type);
CREATE INDEX IF NOT EXISTS idx_products_main_ingredient ON products(main_ingredient);
CREATE INDEX IF NOT EXISTS idx_products_cooking_method ON products(cooking_method);
CREATE INDEX IF NOT EXISTS idx_products_cuisine_type ON products(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_products_product_category ON products(product_category);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location_lat, location_lon);
CREATE INDEX IF NOT EXISTS idx_products_food_preferences ON products USING GIN(food_preferences);
