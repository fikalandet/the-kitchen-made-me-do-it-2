/*
  # Update Recipe Details - Change Single Fields to Arrays

  1. Changes
    - Change meal_type to meal_types (text[] array)
    - Change cooking_method to cooking_methods (text[] array)
    - Add cuisine_types (text[] array) alongside existing cuisine_type
    - These fields support multiple selections for better filtering
      
  2. Notes
    - Uses IF NOT EXISTS to safely add new array columns
    - Preserves existing data where possible
    - Arrays allow multiple values for comprehensive filtering on homepage
*/

DO $$
BEGIN
  -- Add new array columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'meal_types'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN meal_types text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'cooking_methods'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN cooking_methods text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'cuisine_types'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN cuisine_types text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;

-- Migrate existing single values to arrays (if data exists)
UPDATE recipe_details 
SET meal_types = ARRAY[meal_type]::text[]
WHERE meal_type IS NOT NULL AND meal_type != '' AND (meal_types IS NULL OR array_length(meal_types, 1) IS NULL);

UPDATE recipe_details 
SET cooking_methods = ARRAY[cooking_method]::text[]
WHERE cooking_method IS NOT NULL AND cooking_method != '' AND (cooking_methods IS NULL OR array_length(cooking_methods, 1) IS NULL);

UPDATE recipe_details 
SET cuisine_types = ARRAY[cuisine_type]::text[]
WHERE cuisine_type IS NOT NULL AND cuisine_type != '' AND (cuisine_types IS NULL OR array_length(cuisine_types, 1) IS NULL);
