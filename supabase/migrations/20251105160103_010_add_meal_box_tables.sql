/*
  # Add Meal Box Functionality

  1. New Tables
    - `meal_box_templates` - Pre-defined meal box templates with inspirational variants
      - `id` (uuid, primary key)
      - `name` (text) - Template name (e.g., "Veckans klassiker", "Familjepaket")
      - `description` (text) - Description of the template
      - `target_audience` (text) - Who it's for (e.g., "Familjer", "Singles")
      - `image_url` (text) - Optional image for the template
      - `is_active` (boolean) - Whether template is available
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `meal_box_dishes` - Junction table linking meal boxes to dishes
      - `id` (uuid, primary key)
      - `meal_box_id` (uuid, references products) - The meal box product
      - `dish_id` (uuid, references products) - The dish included in the box
      - `portions_per_dish` (integer) - Number of portions for this dish
      - `sort_order` (integer) - Display order in the meal box
      - `created_at` (timestamptz)

    - `meal_box_details` - Additional details for meal box products
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products) - The meal box product
      - `template_id` (uuid, references meal_box_templates) - Optional template used
      - `total_dishes` (integer) - Total number of different dishes
      - `delivery_method` (text) - 'delivery' or 'pickup'
      - `delivery_day` (text) - Day(s) for delivery (e.g., "Måndag")
      - `delivery_time_start` (time) - Start of delivery window
      - `delivery_time_end` (time) - End of delivery window
      - `delivery_notes` (text) - Additional delivery information
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Meal box templates are public (read-only for everyone, managed by admins)
    - Sellers can manage their own meal boxes and meal box details
    - Anyone can view meal box dishes for available products

  3. Indexes
    - Index on meal_box_id and dish_id for efficient lookups
    - Index on template_id for template-based searches
    - Index on delivery_method and delivery_day for filtering

  4. Sample Templates
    - Insert popular meal box templates for inspiration
*/

-- Create meal box templates table
CREATE TABLE IF NOT EXISTS meal_box_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_audience text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meal box dishes junction table
CREATE TABLE IF NOT EXISTS meal_box_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_box_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  dish_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  portions_per_dish integer DEFAULT 2,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(meal_box_id, dish_id)
);

-- Create meal box details table
CREATE TABLE IF NOT EXISTS meal_box_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  template_id uuid REFERENCES meal_box_templates(id) ON DELETE SET NULL,
  total_dishes integer DEFAULT 0,
  delivery_method text DEFAULT 'pickup',
  delivery_day text,
  delivery_time_start time,
  delivery_time_end time,
  delivery_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meal_box_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_box_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_box_details ENABLE ROW LEVEL SECURITY;

-- Meal box templates policies (public read, admin write)
CREATE POLICY "Anyone can view active meal box templates"
  ON meal_box_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage meal box templates"
  ON meal_box_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Meal box dishes policies
CREATE POLICY "Anyone can view meal box dishes for available products"
  ON meal_box_dishes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

CREATE POLICY "Sellers can manage dishes in their meal boxes"
  ON meal_box_dishes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update dishes in their meal boxes"
  ON meal_box_dishes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete dishes from their meal boxes"
  ON meal_box_dishes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = meal_box_id
      AND products.seller_id = auth.uid()
    )
  );

-- Meal box details policies
CREATE POLICY "Anyone can view meal box details for available products"
  ON meal_box_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND (products.available = true OR products.seller_id = auth.uid())
    )
  );

CREATE POLICY "Sellers can manage their meal box details"
  ON meal_box_details FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update their meal box details"
  ON meal_box_details FOR UPDATE
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

CREATE POLICY "Sellers can delete their meal box details"
  ON meal_box_details FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meal_box_dishes_meal_box_id ON meal_box_dishes(meal_box_id);
CREATE INDEX IF NOT EXISTS idx_meal_box_dishes_dish_id ON meal_box_dishes(dish_id);
CREATE INDEX IF NOT EXISTS idx_meal_box_details_product_id ON meal_box_details(product_id);
CREATE INDEX IF NOT EXISTS idx_meal_box_details_template_id ON meal_box_details(template_id);
CREATE INDEX IF NOT EXISTS idx_meal_box_details_delivery ON meal_box_details(delivery_method, delivery_day);

-- Insert sample meal box templates
INSERT INTO meal_box_templates (name, description, target_audience, is_active) VALUES
  ('Veckans klassiker', 'En perfekt mix av tidlösa favoriter som passar hela familjen. Inkluderar traditionella svenska rätter med moderna twist.', 'Familjer', true),
  ('Snabbt & Enkelt', 'För dig som har ont om tid men inte vill kompromissa med smaken. Alla rätter tar max 30 minuter att tillaga.', 'Singlar och stressade familjer', true),
  ('Världens smaker', 'En kulinarisk resa runt jorden med autentiska recept från olika kulturer. Upptäck nya favoriter!', 'Äventyrliga matälskare', true),
  ('Hälsosam vecka', 'Näringsrika och balanserade måltider med fokus på färska grönsaker, magert protein och fullkorn.', 'Hälsomedvetna', true),
  ('Barnfavoriter', 'Populära rätter som barnen älskar, men med lite extra näring gömd i maten. Perfekt för krävande småätare.', 'Familjer med barn', true),
  ('Vegetarisk gourmet', 'Avancerade vegetariska rätter som imponerar även på köttalskare. Fokus på säsongens bästa råvaror.', 'Vegetarianer och flexitarianer', true),
  ('Budget-smart', 'Prisvärt utan att tumma på smaken. Smarta ingrediensval som ger maximalt för pengarna.', 'Studenter och budgetmedvetna', true),
  ('Romantisk helg', 'Två rätter designade för en mysig date night hemma. Elegant mat som är enkel att tillaga tillsammans.', 'Par', true),
  ('Mealprep-paketet', 'Rätter optimerade för att hålla bra i kylen hela veckan. Perfekt för den som planerar sina måltider.', 'Meal preppers', true),
  ('Komfort-mat', 'Värmande och mättande klassiker som får dig att känna dig hemma. Som mormors mat, fast lite finare.', 'Alla', true)
ON CONFLICT DO NOTHING;
