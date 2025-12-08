/*
  # Add batch number to cooking sessions

  1. Changes
    - Add batch_number field to cooking_sessions table
    - This allows chefs to track batch production numbers for inventory management

  2. Notes
    - Optional field, only relevant for batch-type sessions
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cooking_sessions' AND column_name = 'batch_number'
  ) THEN
    ALTER TABLE cooking_sessions ADD COLUMN batch_number text;
  END IF;
END $$;