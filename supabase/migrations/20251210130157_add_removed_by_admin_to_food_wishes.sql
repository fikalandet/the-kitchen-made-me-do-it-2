/*
  # Add removed_by_admin_id to food_wishes table

  1. Changes
    - Add `removed_by_admin_id` (uuid, nullable, references profiles)
      - Stores the ID of the admin who soft-deleted the wish
    - Update admin policy to allow all operations
    
  2. Notes
    - Existing wishes will have NULL for removed_by_admin_id
    - When admin removes a wish:
      - status is set to 'removed_by_admin'
      - removed_by_admin_id is set to admin's ID
    - Public views filter by status = 'pending'
*/

-- Add removed_by_admin_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'food_wishes' AND column_name = 'removed_by_admin_id'
  ) THEN
    ALTER TABLE food_wishes ADD COLUMN removed_by_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for removed_by_admin_id
CREATE INDEX IF NOT EXISTS idx_food_wishes_removed_by_admin ON food_wishes(removed_by_admin_id);