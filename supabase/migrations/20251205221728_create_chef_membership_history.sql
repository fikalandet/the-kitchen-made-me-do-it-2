/*
  # Skapa historik för kockars medlemskap

  1. Ny tabell: chef_membership_history
    - `id` (uuid, primary key)
    - `chef_id` (uuid, foreign key till profiles)
    - `old_level` (text) - tidigare medlemsnivå
    - `new_level` (text) - ny medlemsnivå
    - `is_temporary` (boolean) - om ändringen är tillfällig
    - `valid_until` (date, nullable) - när tillfällig ändring upphör
    - `reason` (text, nullable) - anledning till ändring
    - `changed_by_admin_id` (uuid, nullable) - vilken admin som gjorde ändringen
    - `created_at` (timestamp) - när ändringen gjordes

  2. Säkerhet
    - Enable RLS på tabellen
    - Endast admins kan läsa och skriva
*/

CREATE TABLE IF NOT EXISTS chef_membership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_level text NOT NULL,
  new_level text NOT NULL,
  is_temporary boolean NOT NULL DEFAULT false,
  valid_until date,
  reason text,
  changed_by_admin_id uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chef_membership_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view membership history"
  ON chef_membership_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert membership history"
  ON chef_membership_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_chef_membership_history_chef_id 
  ON chef_membership_history(chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_membership_history_created_at 
  ON chef_membership_history(created_at DESC);
