/*
  # Add is_test flag to message_threads

  1. Changes
    - Add `is_test` boolean column to message_threads table
    - Default to false for existing records
    - Used to identify test data created in sandbox mode

  2. Security
    - No RLS changes needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'message_threads' AND column_name = 'is_test'
  ) THEN
    ALTER TABLE message_threads ADD COLUMN is_test boolean DEFAULT false;
  END IF;
END $$;
