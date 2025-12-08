/*
  # Add Product Type-Specific Tables
  
  1. New Tables
    - `subscription_details` - Details for subscription products (capacity, delivery schedule)
    - `batch_inventory` - Batch tracking for frozen products (batch numbers, expiry dates)
    - `cooking_schedule` - Scheduling details for "På spisen nu" products
    - `catering_bookings` - Catering and "Hyr mig" booking requests
    - `product_visibility` - Track where products are displayed (campaigns, flows)
    
  2. Changes to Existing Tables
    - Add status field to products table (active, paused, out_of_stock)
    - Add product_stats for tracking sales and views
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for sellers to manage their product-specific data
*/

-- Add status field to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE products ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Subscription details table
CREATE TABLE IF NOT EXISTS subscription_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  max_subscribers integer NOT NULL DEFAULT 10,
  current_subscribers integer NOT NULL DEFAULT 0,
  delivery_frequency text NOT NULL,
  delivery_day text,
  delivery_time text,
  next_delivery_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Batch inventory for frozen products
CREATE TABLE IF NOT EXISTS batch_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number text NOT NULL,
  production_date date NOT NULL,
  expiry_date date NOT NULL,
  quantity_produced integer NOT NULL DEFAULT 0,
  quantity_remaining integer NOT NULL DEFAULT 0,
  storage_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cooking schedule for "På spisen nu"
CREATE TABLE IF NOT EXISTS cooking_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cooking_date date NOT NULL,
  cooking_time time NOT NULL,
  planned_portions integer NOT NULL DEFAULT 1,
  recipe_scaling_factor numeric(5,2) DEFAULT 1.0,
  ingredients_list jsonb,
  shopping_list jsonb,
  status text DEFAULT 'planned',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Catering and hire chef bookings
CREATE TABLE IF NOT EXISTS catering_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text,
  customer_phone text,
  event_date date NOT NULL,
  event_time time,
  number_of_guests integer,
  duration_hours numeric(4,2),
  location text,
  special_requests text,
  quoted_price numeric(10,2),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product visibility and campaigns
CREATE TABLE IF NOT EXISTS product_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_location text NOT NULL,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  campaign_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscribers table for tracking subscription customers
CREATE TABLE IF NOT EXISTS subscription_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscription_details(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  status text DEFAULT 'active',
  delivery_address text,
  delivery_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subscription_id, customer_id)
);

-- Enable RLS
ALTER TABLE subscription_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_subscribers ENABLE ROW LEVEL SECURITY;

-- Subscription details policies
CREATE POLICY "Sellers can view their subscription details"
  ON subscription_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = subscription_details.product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can insert subscription details"
  ON subscription_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their subscription details"
  ON subscription_details FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = subscription_details.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = subscription_details.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Batch inventory policies
CREATE POLICY "Sellers can view their batch inventory"
  ON batch_inventory FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = batch_inventory.product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can manage their batch inventory"
  ON batch_inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their batch inventory"
  ON batch_inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = batch_inventory.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = batch_inventory.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Cooking schedule policies
CREATE POLICY "Sellers can view their cooking schedule"
  ON cooking_schedule FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = cooking_schedule.product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can manage cooking schedule"
  ON cooking_schedule FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update cooking schedule"
  ON cooking_schedule FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = cooking_schedule.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = cooking_schedule.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Catering bookings policies
CREATE POLICY "Sellers can view their catering bookings"
  ON catering_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = catering_bookings.product_id 
      AND products.seller_id = auth.uid()
    ) OR customer_id = auth.uid()
  );

CREATE POLICY "Anyone can create catering booking requests"
  ON catering_bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Sellers can update their catering bookings"
  ON catering_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = catering_bookings.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = catering_bookings.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Product visibility policies
CREATE POLICY "Everyone can view active product visibility"
  ON product_visibility FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Sellers can manage their product visibility"
  ON product_visibility FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_id 
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their product visibility"
  ON product_visibility FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_visibility.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_visibility.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Subscription subscribers policies
CREATE POLICY "Sellers can view their subscribers"
  ON subscription_subscribers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscription_details sd
      JOIN products p ON p.id = sd.product_id
      WHERE sd.id = subscription_subscribers.subscription_id
      AND p.seller_id = auth.uid()
    ) OR customer_id = auth.uid()
  );

CREATE POLICY "Customers can subscribe"
  ON subscription_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers and sellers can update subscriptions"
  ON subscription_subscribers FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM subscription_details sd
      JOIN products p ON p.id = sd.product_id
      WHERE sd.id = subscription_subscribers.subscription_id
      AND p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM subscription_details sd
      JOIN products p ON p.id = sd.product_id
      WHERE sd.id = subscription_subscribers.subscription_id
      AND p.seller_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscription_details_product_id ON subscription_details(product_id);
CREATE INDEX IF NOT EXISTS idx_batch_inventory_product_id ON batch_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_cooking_schedule_product_id ON cooking_schedule(product_id);
CREATE INDEX IF NOT EXISTS idx_cooking_schedule_date ON cooking_schedule(cooking_date);
CREATE INDEX IF NOT EXISTS idx_catering_bookings_product_id ON catering_bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_catering_bookings_status ON catering_bookings(status);
CREATE INDEX IF NOT EXISTS idx_product_visibility_product_id ON product_visibility(product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_subscribers_subscription_id ON subscription_subscribers(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_subscribers_customer_id ON subscription_subscribers(customer_id);
