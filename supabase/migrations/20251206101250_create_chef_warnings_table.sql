/*
  # Skapa varningssystem för kockar

  1. Ny tabell
    - `chef_warnings`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key till profiles)
      - `type` (text, typ av varning)
      - `severity` (text, allvarlighetsgrad)
      - `status` (text, öppen eller stängd)
      - `message` (text, beskrivning av varning)
      - `created_at` (timestamp)
      - `resolved_at` (timestamp, nullable)
      - `resolved_by` (text, nullable, admin som stängde)

  2. Säkerhet
    - Aktivera RLS på `chef_warnings`
    - Admin kan se, skapa, uppdatera alla varningar
    - Kockar kan bara se sina egna varningar
*/

CREATE TABLE IF NOT EXISTS chef_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Bemötande', 'Leverans', 'Hygien', 'Annat')),
  severity text NOT NULL DEFAULT 'medel' CHECK (severity IN ('låg', 'medel', 'hög')),
  status text NOT NULL DEFAULT 'öppen' CHECK (status IN ('öppen', 'stängd')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by text
);

ALTER TABLE chef_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all chef warnings"
  ON chef_warnings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Chefs can view own warnings"
  ON chef_warnings FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Admins can create chef warnings"
  ON chef_warnings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update chef warnings"
  ON chef_warnings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE INDEX idx_chef_warnings_chef_id ON chef_warnings(chef_id);
CREATE INDEX idx_chef_warnings_status ON chef_warnings(status);
