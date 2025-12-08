/*
  # Create chef commission history table

  1. New Tables
    - `chef_commission_history`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, references profiles)
      - `commission_type` (text) - 'standard' or 'temporary'
      - `commission_percent` (numeric) - the commission percentage
      - `valid_from` (date) - start date for the commission
      - `valid_to` (date) - end date (null = indefinite)
      - `note` (text) - reason/note for the commission
      - `created_by` (uuid) - admin who made the change
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `chef_commission_history` table
    - Add policy for authenticated users to read
    - Add policy for admins to insert/update

  3. Purpose
    - Track all commission changes for each chef
    - Provide historical record of commission adjustments
*/

CREATE TABLE IF NOT EXISTS chef_commission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commission_type text NOT NULL CHECK (commission_type IN ('standard', 'temporary')),
  commission_percent numeric(5,2) NOT NULL,
  valid_from date,
  valid_to date,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chef_commission_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view commission history"
  ON chef_commission_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert commission history"
  ON chef_commission_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_chef_commission_history_chef_id 
  ON chef_commission_history(chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_commission_history_created_at 
  ON chef_commission_history(created_at DESC);