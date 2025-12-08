/*
  # Update Recipe Details Table

  1. Changes
    - Add missing fields to recipe_details table:
      - meal_type (type of dish like soppa, gryta, etc.)
      - cooking_method (cooking technique)
      - main_ingredients (array for filtering)
      - food_preferences (array for filtering)
    - These fields are used for search and filtering on the homepage
      
  2. Notes
    - Uses IF NOT EXISTS to safely add columns
    - No data loss, only adding new optional fields
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'meal_type'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN meal_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'cooking_method'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN cooking_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'main_ingredients'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN main_ingredients text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_details' AND column_name = 'food_preferences'
  ) THEN
    ALTER TABLE recipe_details ADD COLUMN food_preferences text[] DEFAULT ARRAY[]::text[];
  END IF;
END $$;
