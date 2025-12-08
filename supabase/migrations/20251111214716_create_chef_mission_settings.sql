/*
  # Chef Mission Settings Table

  1. New Table
    - `chef_mission_settings` stores mission-specific configurations per chef
    - Each mission type (live, batch, delivery, event) has its own settings stored in jsonb
    
  2. Security
    - Enable RLS
    - Chefs can only manage their own settings
*/

CREATE TABLE IF NOT EXISTS chef_mission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission text NOT NULL CHECK (mission IN ('live','batch','delivery','event')),
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(chef_id, mission)
);

ALTER TABLE chef_mission_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own mission settings"
  ON chef_mission_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own mission settings"
  ON chef_mission_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own mission settings"
  ON chef_mission_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own mission settings"
  ON chef_mission_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_mission_settings_chef ON chef_mission_settings(chef_id, mission);