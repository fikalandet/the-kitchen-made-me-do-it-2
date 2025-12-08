/*
  # Create chef_customer_notes table

  1. New Tables
    - `chef_customer_notes`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, references profiles) - Kocken som skriver anteckningen
      - `customer_id` (uuid, references profiles) - Kunden som anteckningen gäller
      - `notes` (text) - Anteckningar om kunden
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `chef_customer_notes` table
    - Add policy for chefs to read/write their own notes
*/

CREATE TABLE IF NOT EXISTS chef_customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) NOT NULL,
  customer_id uuid REFERENCES profiles(id) NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(chef_id, customer_id)
);

ALTER TABLE chef_customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view their own customer notes"
  ON chef_customer_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert their own customer notes"
  ON chef_customer_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update their own customer notes"
  ON chef_customer_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete their own customer notes"
  ON chef_customer_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_customer_notes_chef_id ON chef_customer_notes(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_customer_notes_customer_id ON chef_customer_notes(customer_id);
