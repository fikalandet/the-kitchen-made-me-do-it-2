/*
  # Add support for multiple delivery sessions per day

  1. Changes
    - Add new table `chef_delivery_sessions` to track multiple delivery windows per day
    - Each chef can configure multiple delivery time slots per weekday
    - Supports different number of stops and distance limits per session

  2. Security
    - Enable RLS on `chef_delivery_sessions` table
    - Add policy for chefs to manage their own delivery sessions
*/

CREATE TABLE IF NOT EXISTS chef_delivery_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  session_name text DEFAULT 'Utkörning',
  antal_stopp integer DEFAULT 10,
  max_avstånd_mil integer DEFAULT 3,
  packtid_minuter integer DEFAULT 30,
  utkörning_start time NOT NULL,
  utkörning_slut time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chef_delivery_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can manage own delivery sessions"
  ON chef_delivery_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE INDEX IF NOT EXISTS idx_delivery_sessions_chef_day 
  ON chef_delivery_sessions(chef_id, day_of_week);
