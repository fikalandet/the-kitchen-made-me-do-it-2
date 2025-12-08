/*
  # Update daily capacity settings for multiple missions

  1. Changes
    - Change mission field from single text to text array to support multiple missions per day
    - Update check constraint to allow multiple mission values
    - Existing data will be migrated to array format

  2. Notes
    - This allows chefs to select multiple activities for a single day
    - Example: A chef can do both 'live' and 'batch' on the same day
*/

-- First, add a temporary column for the new format
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_capacity_settings' AND column_name = 'missions'
  ) THEN
    ALTER TABLE daily_capacity_settings ADD COLUMN missions text[] DEFAULT ARRAY['live']::text[];
  END IF;
END $$;

-- Migrate existing mission data to the new missions array
UPDATE daily_capacity_settings 
SET missions = ARRAY[mission]::text[]
WHERE mission IS NOT NULL AND missions = ARRAY['live']::text[];

-- Drop the old mission column
ALTER TABLE daily_capacity_settings DROP COLUMN IF EXISTS mission;

-- Rename missions to mission
ALTER TABLE daily_capacity_settings RENAME COLUMN missions TO mission;

-- Add check constraint for valid mission values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_capacity_settings_mission_check'
  ) THEN
    ALTER TABLE daily_capacity_settings 
    ADD CONSTRAINT daily_capacity_settings_mission_check 
    CHECK (
      mission <@ ARRAY['live','batch','delivery','event','admin','pause']::text[]
    );
  END IF;
END $$;