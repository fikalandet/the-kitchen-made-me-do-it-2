/*
  # Create Chef Batch Sessions Table

  1. New Tables
    - `chef_batch_sessions`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key to profiles)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `product_id` (uuid, foreign key to products)
      - `antal_portioner` (integer)
      - `förberedelsetid_minuter` (integer)
      - `tillagningstid_start` (time)
      - `tillagningstid_slut` (time)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `chef_batch_sessions` table
    - Add policies for chefs to manage their own batch sessions
*/

CREATE TABLE IF NOT EXISTS chef_batch_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  antal_portioner integer NOT NULL DEFAULT 20,
  förberedelsetid_minuter integer DEFAULT 60,
  tillagningstid_start time NOT NULL,
  tillagningstid_slut time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chef_batch_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own batch sessions"
  ON chef_batch_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own batch sessions"
  ON chef_batch_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own batch sessions"
  ON chef_batch_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own batch sessions"
  ON chef_batch_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_batch_sessions_chef_id ON chef_batch_sessions(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_batch_sessions_day_of_week ON chef_batch_sessions(day_of_week);
CREATE INDEX IF NOT EXISTS idx_chef_batch_sessions_product_id ON chef_batch_sessions(product_id);