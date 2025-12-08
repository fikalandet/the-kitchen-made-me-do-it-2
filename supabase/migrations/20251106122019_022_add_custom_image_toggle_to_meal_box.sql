/*
  # Add Custom Image Toggle for Meal Boxes

  1. Changes
    - Add `use_custom_image` column to `meal_box_details` table
      - Boolean flag to determine if custom image or auto-generated collage should be used
      - Defaults to `false` (use auto-generated collage)

  2. Notes
    - When `use_custom_image` is false, the frontend will render the MealBoxCollage component
    - When `use_custom_image` is true, the frontend will use the `image_url` from the products table
    - This gives chefs flexibility while defaulting to the smart automatic collage
*/

-- Add use_custom_image column to meal_box_details
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_box_details' AND column_name = 'use_custom_image'
  ) THEN
    ALTER TABLE meal_box_details ADD COLUMN use_custom_image boolean DEFAULT false;
  END IF;
END $$;
