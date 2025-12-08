/*
  # Add wish food info text field

  ## Changes
  
  1. **profiles table**
    - Add `wish_food_info_text` text field for custom information shown in the wish food modal
  
  2. **Security**
    - Field accessible through existing RLS policies
*/

-- Add wish food info text field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wish_food_info_text'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wish_food_info_text text;
  END IF;
END $$;