/*
  # Add day_of_week to chef_mission_settings

  1. Changes
    - Add day_of_week column to chef_mission_settings
    - Change unique constraint to include day_of_week
    - Allow settings to vary per day of week (0=Sunday, 1=Monday, etc.)
  
  2. Notes
    - Existing records will have NULL day_of_week (meaning applies to all days)
    - New records can specify specific days
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chef_mission_settings' AND column_name = 'day_of_week'
  ) THEN
    ALTER TABLE chef_mission_settings ADD COLUMN day_of_week integer;
    ALTER TABLE chef_mission_settings ADD COLUMN is_rest_day boolean DEFAULT false;
    
    ALTER TABLE chef_mission_settings DROP CONSTRAINT IF EXISTS chef_mission_settings_chef_id_mission_key;
    
    ALTER TABLE chef_mission_settings 
      ADD CONSTRAINT chef_mission_settings_chef_id_mission_day_key 
      UNIQUE(chef_id, mission, day_of_week);
  END IF;
END $$;