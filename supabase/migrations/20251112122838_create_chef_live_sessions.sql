/*
  # Create Chef Live Sessions Table

  1. New Tables
    - `chef_live_sessions`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, foreign key to profiles)
      - `product_id` (uuid, foreign key to products)
      - `antal_portioner` (integer)
      - `datum` (date, nullable for recurring sessions)
      - `start_tid` (time)
      - `slut_tid` (time)
      - `alla_måndagar` (boolean)
      - `alla_tisdagar` (boolean)
      - `alla_onsdagar` (boolean)
      - `alla_torsdagar` (boolean)
      - `alla_fredagar` (boolean)
      - `alla_lördagar` (boolean)
      - `alla_söndagar` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `chef_live_sessions` table
    - Add policy for chefs to manage their own live sessions
*/

CREATE TABLE IF NOT EXISTS chef_live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  antal_portioner integer NOT NULL DEFAULT 20,
  datum date,
  start_tid time NOT NULL,
  slut_tid time NOT NULL,
  alla_måndagar boolean DEFAULT false,
  alla_tisdagar boolean DEFAULT false,
  alla_onsdagar boolean DEFAULT false,
  alla_torsdagar boolean DEFAULT false,
  alla_fredagar boolean DEFAULT false,
  alla_lördagar boolean DEFAULT false,
  alla_söndagar boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chef_live_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own live sessions"
  ON chef_live_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own live sessions"
  ON chef_live_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own live sessions"
  ON chef_live_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own live sessions"
  ON chef_live_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE INDEX IF NOT EXISTS idx_chef_live_sessions_chef_id ON chef_live_sessions(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_live_sessions_datum ON chef_live_sessions(datum);
CREATE INDEX IF NOT EXISTS idx_chef_live_sessions_product_id ON chef_live_sessions(product_id);