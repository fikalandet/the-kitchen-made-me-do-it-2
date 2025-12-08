/*
  # Add Capacity Management for Meal Boxes

  ## Overview
  This migration adds comprehensive capacity management for meal boxes, allowing chefs to:
  - Set maximum order capacity per delivery period
  - Track current bookings in real-time
  - Support both one-time and recurring meal box offerings
  - Set different capacities for different delivery days

  ## 1. New Tables
    
    ### `meal_box_capacity_periods`
    Defines capacity limits for specific time periods (e.g., weekly delivery slots)
    - `id` (uuid, primary key)
    - `product_id` (uuid, references products) - The meal box product
    - `delivery_date` (date) - Specific delivery date for this capacity period
    - `max_capacity` (integer) - Maximum number of orders accepted
    - `current_bookings` (integer) - Current number of confirmed bookings
    - `is_sold_out` (boolean) - Automatically set when capacity reached
    - `is_active` (boolean) - Whether this period is accepting orders
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### `meal_box_recurring_schedule`
    Configuration for recurring meal box offerings
    - `id` (uuid, primary key)
    - `product_id` (uuid, references products) - The meal box product
    - `is_recurring` (boolean) - Whether this is a recurring offering
    - `recurrence_pattern` (text) - Pattern: 'weekly', 'biweekly', 'monthly'
    - `weekdays` (text[]) - Days of week for delivery (e.g., ['monday', 'wednesday'])
    - `default_capacity_per_slot` (integer) - Default capacity for each generated slot
    - `auto_generate_weeks_ahead` (integer) - How many weeks to auto-generate (default 4)
    - `is_active` (boolean) - Whether recurring generation is active
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Updates to Existing Tables
    
    ### `meal_box_details`
    - Add `has_capacity_limit` (boolean) - Whether capacity management is enabled
    - Add `unlimited_capacity` (boolean) - True if no capacity limit
    - Add `show_remaining_spots` (boolean) - Whether to display remaining capacity to customers
    - Add `low_capacity_threshold` (integer) - When to show "Almost full" warning

  ## 3. Indexes
    - Index on product_id and delivery_date for efficient capacity lookups
    - Index on is_sold_out for filtering available slots
    - Index on delivery_date for date-range queries

  ## 4. Security (RLS Policies)
    - Customers can view capacity information for available products
    - Sellers can manage capacity for their own products
    - Automatic capacity updates through database functions

  ## 5. Database Functions
    - Function to check and update sold_out status
    - Function to increment booking count safely
    - Function to generate recurring capacity periods
    - Trigger to auto-update sold_out flag when bookings change
*/

-- Add new columns to meal_box_details
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_box_details' AND column_name = 'has_capacity_limit'
  ) THEN
    ALTER TABLE meal_box_details ADD COLUMN has_capacity_limit boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_box_details' AND column_name = 'unlimited_capacity'
  ) THEN
    ALTER TABLE meal_box_details ADD COLUMN unlimited_capacity boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_box_details' AND column_name = 'show_remaining_spots'
  ) THEN
    ALTER TABLE meal_box_details ADD COLUMN show_remaining_spots boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_box_details' AND column_name = 'low_capacity_threshold'
  ) THEN
    ALTER TABLE meal_box_details ADD COLUMN low_capacity_threshold integer DEFAULT 3;
  END IF;
END $$;

-- Create meal_box_capacity_periods table
CREATE TABLE IF NOT EXISTS meal_box_capacity_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delivery_date date NOT NULL,
  max_capacity integer NOT NULL DEFAULT 10,
  current_bookings integer NOT NULL DEFAULT 0,
  is_sold_out boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, delivery_date),
  CONSTRAINT valid_bookings CHECK (current_bookings >= 0 AND current_bookings <= max_capacity)
);

-- Create meal_box_recurring_schedule table
CREATE TABLE IF NOT EXISTS meal_box_recurring_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text DEFAULT 'weekly',
  weekdays text[] DEFAULT ARRAY[]::text[],
  default_capacity_per_slot integer DEFAULT 10,
  auto_generate_weeks_ahead integer DEFAULT 4,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_pattern CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly'))
);

-- Enable RLS on new tables
ALTER TABLE meal_box_capacity_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_box_recurring_schedule ENABLE ROW LEVEL SECURITY;

-- Policies for meal_box_capacity_periods
CREATE POLICY "Anyone can view capacity for available products"
  ON meal_box_capacity_periods FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

CREATE POLICY "Sellers can manage capacity for their products"
  ON meal_box_capacity_periods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update capacity for their products"
  ON meal_box_capacity_periods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete capacity for their products"
  ON meal_box_capacity_periods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Policies for meal_box_recurring_schedule
CREATE POLICY "Anyone can view recurring schedules for available products"
  ON meal_box_recurring_schedule FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

CREATE POLICY "Sellers can manage recurring schedules for their products"
  ON meal_box_recurring_schedule FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update recurring schedules for their products"
  ON meal_box_recurring_schedule FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete recurring schedules for their products"
  ON meal_box_recurring_schedule FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_capacity_periods_product_date ON meal_box_capacity_periods(product_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_capacity_periods_sold_out ON meal_box_capacity_periods(is_sold_out) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_capacity_periods_delivery_date ON meal_box_capacity_periods(delivery_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_schedule_product ON meal_box_recurring_schedule(product_id);

-- Function to update sold_out status based on bookings
CREATE OR REPLACE FUNCTION update_capacity_sold_out_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_sold_out := (NEW.current_bookings >= NEW.max_capacity);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update sold_out status
DROP TRIGGER IF EXISTS trigger_update_capacity_sold_out ON meal_box_capacity_periods;
CREATE TRIGGER trigger_update_capacity_sold_out
  BEFORE UPDATE OF current_bookings, max_capacity ON meal_box_capacity_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_capacity_sold_out_status();

-- Function to safely increment booking count
CREATE OR REPLACE FUNCTION increment_capacity_booking(
  p_product_id uuid,
  p_delivery_date date,
  p_quantity integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  v_available_capacity integer;
  v_rows_updated integer;
BEGIN
  -- Lock the row and check available capacity
  SELECT (max_capacity - current_bookings) INTO v_available_capacity
  FROM meal_box_capacity_periods
  WHERE product_id = p_product_id
    AND delivery_date = p_delivery_date
    AND is_active = true
  FOR UPDATE;

  -- Check if there's enough capacity
  IF v_available_capacity IS NULL OR v_available_capacity < p_quantity THEN
    RETURN false;
  END IF;

  -- Update the booking count
  UPDATE meal_box_capacity_periods
  SET current_bookings = current_bookings + p_quantity
  WHERE product_id = p_product_id
    AND delivery_date = p_delivery_date
    AND is_active = true
    AND (current_bookings + p_quantity) <= max_capacity;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  RETURN v_rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate recurring capacity periods
CREATE OR REPLACE FUNCTION generate_recurring_capacity_periods(
  p_product_id uuid,
  p_weeks_ahead integer DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  v_schedule RECORD;
  v_weeks_to_generate integer;
  v_start_date date;
  v_end_date date;
  v_current_date date;
  v_weekday text;
  v_periods_created integer := 0;
BEGIN
  -- Get the recurring schedule
  SELECT * INTO v_schedule
  FROM meal_box_recurring_schedule
  WHERE product_id = p_product_id
    AND is_recurring = true
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Determine how many weeks to generate
  v_weeks_to_generate := COALESCE(p_weeks_ahead, v_schedule.auto_generate_weeks_ahead);
  
  -- Set date range
  v_start_date := CURRENT_DATE;
  v_end_date := CURRENT_DATE + (v_weeks_to_generate * 7 || ' days')::interval;

  -- Loop through each day in the range
  v_current_date := v_start_date;
  WHILE v_current_date <= v_end_date LOOP
    -- Get the weekday name
    v_weekday := lower(to_char(v_current_date, 'Day'));
    v_weekday := trim(v_weekday);

    -- Check if this weekday is in the schedule
    IF v_weekday = ANY(v_schedule.weekdays) THEN
      -- Insert capacity period if it doesn't exist
      INSERT INTO meal_box_capacity_periods (
        product_id,
        delivery_date,
        max_capacity,
        current_bookings,
        is_sold_out,
        is_active
      )
      VALUES (
        p_product_id,
        v_current_date,
        v_schedule.default_capacity_per_slot,
        0,
        false,
        true
      )
      ON CONFLICT (product_id, delivery_date) DO NOTHING;

      IF FOUND THEN
        v_periods_created := v_periods_created + 1;
      END IF;
    END IF;

    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_periods_created;
END;
$$ LANGUAGE plpgsql;

-- Function to get available capacity for a product and date
CREATE OR REPLACE FUNCTION get_available_capacity(
  p_product_id uuid,
  p_delivery_date date
)
RETURNS integer AS $$
DECLARE
  v_capacity RECORD;
  v_meal_box_details RECORD;
BEGIN
  -- Check if capacity management is enabled
  SELECT * INTO v_meal_box_details
  FROM meal_box_details
  WHERE product_id = p_product_id;

  -- If no capacity management or unlimited capacity
  IF NOT FOUND OR NOT v_meal_box_details.has_capacity_limit OR v_meal_box_details.unlimited_capacity THEN
    RETURN 999999;
  END IF;

  -- Get the capacity period
  SELECT * INTO v_capacity
  FROM meal_box_capacity_periods
  WHERE product_id = p_product_id
    AND delivery_date = p_delivery_date
    AND is_active = true;

  -- If no period found, return 0
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Return available capacity
  RETURN GREATEST(0, v_capacity.max_capacity - v_capacity.current_bookings);
END;
$$ LANGUAGE plpgsql;
