/*
  # Planning & Preparation System for Chef Panel

  1. New Tables
    - `daily_capacity_settings`
      - Stores chef's daily kitchen limits, mission, and capacity rules
      - Fields: max_portions_per_day, max_portions_per_dish, cooking_times, delivery_capacity, 
        lead_time, parallel_capacity, daily_mission, pause_days, cutoff_rule, mission_color_map
    
    - `cooking_sessions`
      - Stores live and batch cooking sessions
      - Fields: session_type (live/batch), date, start_time, end_time, recipes, 
        show_in_feed, auto_refill_freezer, comment, status
    
    - `cook_prep_checklist`
      - Tracks preparation steps for cooking sessions
      - Fields: session_id, step_name, step_order, is_completed, completed_at
    
    - `shopping_lists`
      - Generated shopping lists from recipes
      - Fields: session_id, ingredient_name, needed_qty, stock_qty, shortage_qty, is_purchased
    
    - `freezer_stock`
      - Tracks frozen batch-produced items
      - Fields: product_id, recipe_id, quantity, produced_date, expiry_date
    
    - `stock_movements`
      - Logs all freezer stock changes
      - Fields: product_id, recipe_id, movement_type, quantity, session_id, notes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated chefs to manage their own data
*/

-- Daily capacity settings table
CREATE TABLE IF NOT EXISTS daily_capacity_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week int CHECK (day_of_week >= 0 AND day_of_week <= 6),
  max_portions_per_day int DEFAULT 20,
  max_portions_per_dish int,
  cooking_start_time time,
  cooking_end_time time,
  delivery_capacity int DEFAULT 5,
  lead_time_hours int DEFAULT 48,
  parallel_capacity int DEFAULT 1,
  mission text CHECK (mission IN ('live','batch','delivery','event','admin','pause')),
  is_pause_day boolean DEFAULT false,
  cutoff_percentage int DEFAULT 90,
  mission_color jsonb DEFAULT '{"live":"#10b981","batch":"#3b82f6","delivery":"#f97316","event":"#a855f7","admin":"#6b7280","pause":"#ef4444"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(chef_id, day_of_week)
);

ALTER TABLE daily_capacity_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own capacity settings"
  ON daily_capacity_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own capacity settings"
  ON daily_capacity_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own capacity settings"
  ON daily_capacity_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own capacity settings"
  ON daily_capacity_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

-- Cooking sessions table
CREATE TABLE IF NOT EXISTS cooking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('live','batch')),
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  recipes jsonb DEFAULT '[]'::jsonb,
  show_in_feed boolean DEFAULT false,
  auto_refill_freezer boolean DEFAULT false,
  comment text,
  status text DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own cooking sessions"
  ON cooking_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own cooking sessions"
  ON cooking_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own cooking sessions"
  ON cooking_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own cooking sessions"
  ON cooking_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

-- Cook prep checklist table
CREATE TABLE IF NOT EXISTS cook_prep_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  step_name text NOT NULL,
  step_order int NOT NULL DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cook_prep_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own prep checklists"
  ON cook_prep_checklist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = cook_prep_checklist.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can insert own prep checklists"
  ON cook_prep_checklist FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = cook_prep_checklist.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can update own prep checklists"
  ON cook_prep_checklist FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = cook_prep_checklist.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = cook_prep_checklist.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can delete own prep checklists"
  ON cook_prep_checklist FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = cook_prep_checklist.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  needed_qty decimal(10,2) NOT NULL,
  unit text,
  stock_qty decimal(10,2) DEFAULT 0,
  shortage_qty decimal(10,2),
  is_purchased boolean DEFAULT false,
  purchased_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own shopping lists"
  ON shopping_lists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = shopping_lists.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can insert own shopping lists"
  ON shopping_lists FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = shopping_lists.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can update own shopping lists"
  ON shopping_lists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = shopping_lists.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = shopping_lists.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can delete own shopping lists"
  ON shopping_lists FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions
      WHERE cooking_sessions.id = shopping_lists.session_id
      AND cooking_sessions.chef_id = auth.uid()
    )
  );

-- Freezer stock table
CREATE TABLE IF NOT EXISTS freezer_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES recipe_details(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 0,
  produced_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE freezer_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own freezer stock"
  ON freezer_stock FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own freezer stock"
  ON freezer_stock FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own freezer stock"
  ON freezer_stock FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own freezer stock"
  ON freezer_stock FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  recipe_id uuid REFERENCES recipe_details(id) ON DELETE SET NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('production','sale','waste','adjustment')),
  quantity int NOT NULL,
  session_id uuid REFERENCES cooking_sessions(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can insert own stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_capacity_chef_day ON daily_capacity_settings(chef_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_cooking_sessions_chef_date ON cooking_sessions(chef_id, session_date);
CREATE INDEX IF NOT EXISTS idx_cook_prep_session ON cook_prep_checklist(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_session ON shopping_lists(session_id);
CREATE INDEX IF NOT EXISTS idx_freezer_stock_chef ON freezer_stock(chef_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_chef ON stock_movements(chef_id, created_at DESC);