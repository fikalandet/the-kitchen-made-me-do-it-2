/*
  # Add shopping mission tables

  1. New Tables
    - `chef_shopping_missions` - Stores shopping missions for groceries
    - `shopping_mission_dishes` - Links dishes to shopping missions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS chef_shopping_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid REFERENCES profiles(id) NOT NULL,
  datum date NOT NULL,
  tid time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chef_shopping_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own shopping missions"
  ON chef_shopping_missions FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own shopping missions"
  ON chef_shopping_missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own shopping missions"
  ON chef_shopping_missions FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own shopping missions"
  ON chef_shopping_missions FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE TABLE IF NOT EXISTS shopping_mission_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_mission_id uuid REFERENCES chef_shopping_missions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  antal_portioner integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_mission_dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view dishes for own shopping missions"
  ON shopping_mission_dishes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chef_shopping_missions
      WHERE chef_shopping_missions.id = shopping_mission_dishes.shopping_mission_id
      AND chef_shopping_missions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can insert dishes for own shopping missions"
  ON shopping_mission_dishes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chef_shopping_missions
      WHERE chef_shopping_missions.id = shopping_mission_dishes.shopping_mission_id
      AND chef_shopping_missions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can update dishes for own shopping missions"
  ON shopping_mission_dishes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chef_shopping_missions
      WHERE chef_shopping_missions.id = shopping_mission_dishes.shopping_mission_id
      AND chef_shopping_missions.chef_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chef_shopping_missions
      WHERE chef_shopping_missions.id = shopping_mission_dishes.shopping_mission_id
      AND chef_shopping_missions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can delete dishes for own shopping missions"
  ON shopping_mission_dishes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chef_shopping_missions
      WHERE chef_shopping_missions.id = shopping_mission_dishes.shopping_mission_id
      AND chef_shopping_missions.chef_id = auth.uid()
    )
  );