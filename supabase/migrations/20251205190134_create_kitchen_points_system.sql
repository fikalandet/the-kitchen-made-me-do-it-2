/*
  # Create Kitchen Points System for Chefs

  1. New Columns in profiles table
    - `kitchen_points_balance` (integer) - Current Kitchen points balance for chefs

  2. New Tables
    - `chef_kitchen_points_history`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, references profiles) - The chef whose points changed
      - `delta` (integer) - Points added (positive) or removed (negative)
      - `new_balance` (integer) - Balance after this transaction
      - `reason` (text) - Admin's reason for the change
      - `changed_by_admin_id` (uuid, references profiles) - Admin who made the change
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on chef_kitchen_points_history table
    - Admins can view and insert kitchen points history
    - Chefs can view their own kitchen points history

  4. Notes
    - Kitchen points are separate from Gold points (customer loyalty points)
    - Kitchen points are used for chef rewards, boosts, and platform features
    - All balances default to 0 for existing chefs
*/

-- Add kitchen_points_balance column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kitchen_points_balance integer DEFAULT 0;

-- Create kitchen points history table
CREATE TABLE IF NOT EXISTS chef_kitchen_points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  new_balance integer NOT NULL,
  reason text NOT NULL,
  changed_by_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chef_kitchen_points_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all kitchen points history
CREATE POLICY "Admins can view all kitchen points history"
  ON chef_kitchen_points_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Chefs can view their own kitchen points history
CREATE POLICY "Chefs can view own kitchen points history"
  ON chef_kitchen_points_history FOR SELECT
  TO authenticated
  USING (chef_id = auth.uid());

-- Admins can insert kitchen points history
CREATE POLICY "Admins can insert kitchen points history"
  ON chef_kitchen_points_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chef_kitchen_points_history_chef_id 
  ON chef_kitchen_points_history(chef_id, created_at DESC);
