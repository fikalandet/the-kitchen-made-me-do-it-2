/*
  # Recipe Tables and Templates

  1. New Tables
    - `recipe_templates`
      - Recipe templates for different membership levels
      - Gratis: 0 templates, Silver: 10 templates, Gold: 20 templates
    - `recipe_details`
      - Extended recipe information (difficulty, cooking time, portions, etc.)
    - `recipe_ingredients`
      - Individual ingredients for recipes with amounts and units
    - `recipe_steps`
      - Step-by-step cooking instructions
    - `recipe_nutrition`
      - Nutritional information per serving
    - `recipe_media`
      - Additional images and videos for recipes
      
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own recipes
*/

-- Recipe templates table
CREATE TABLE IF NOT EXISTS recipe_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  membership_level text NOT NULL CHECK (membership_level IN ('silver', 'gold')),
  difficulty text DEFAULT 'medel' CHECK (difficulty IN ('enkel', 'medel', 'avancerad')),
  cuisine_type text,
  meal_type text,
  template_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe templates are viewable by all authenticated users"
  ON recipe_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Recipe details table
CREATE TABLE IF NOT EXISTS recipe_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recipe_title text NOT NULL,
  category text,
  cuisine_type text,
  description_story text,
  difficulty text DEFAULT 'medel' CHECK (difficulty IN ('enkel', 'medel', 'avancerad')),
  cooking_time_minutes integer,
  prep_time_minutes integer,
  total_time_minutes integer,
  servings integer DEFAULT 4,
  price_per_recipe numeric(10,2),
  template_id uuid REFERENCES recipe_templates(id),
  is_premium boolean DEFAULT false,
  is_public boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  season text,
  occasion text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipe details"
  ON recipe_details FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own recipe details"
  ON recipe_details FOR INSERT
  TO authenticated
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own recipe details"
  ON recipe_details FOR UPDATE
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own recipe details"
  ON recipe_details FOR DELETE
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM products WHERE seller_id = auth.uid()
    )
  );

-- Recipe ingredients table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_detail_id uuid NOT NULL REFERENCES recipe_details(id) ON DELETE CASCADE,
  amount text,
  unit text,
  ingredient_name text NOT NULL,
  ingredient_category text,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage ingredients for their recipes"
  ON recipe_ingredients FOR ALL
  TO authenticated
  USING (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  );

-- Recipe steps table
CREATE TABLE IF NOT EXISTS recipe_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_detail_id uuid NOT NULL REFERENCES recipe_details(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  instruction text NOT NULL,
  image_url text,
  video_url text,
  time_minutes integer,
  tips text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage steps for their recipes"
  ON recipe_steps FOR ALL
  TO authenticated
  USING (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  );

-- Recipe nutrition table
CREATE TABLE IF NOT EXISTS recipe_nutrition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_detail_id uuid NOT NULL REFERENCES recipe_details(id) ON DELETE CASCADE,
  calories_per_serving integer,
  protein_g numeric(10,2),
  fat_g numeric(10,2),
  carbs_g numeric(10,2),
  fiber_g numeric(10,2),
  sugar_g numeric(10,2),
  salt_g numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(recipe_detail_id)
);

ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage nutrition for their recipes"
  ON recipe_nutrition FOR ALL
  TO authenticated
  USING (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  );

-- Recipe media table
CREATE TABLE IF NOT EXISTS recipe_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_detail_id uuid NOT NULL REFERENCES recipe_details(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  thumbnail_url text,
  caption text,
  sort_order integer DEFAULT 0,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipe_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage media for their recipes"
  ON recipe_media FOR ALL
  TO authenticated
  USING (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    recipe_detail_id IN (
      SELECT rd.id FROM recipe_details rd
      JOIN products p ON p.id = rd.product_id
      WHERE p.seller_id = auth.uid()
    )
  );

-- Insert recipe templates for Silver members (10 templates)
INSERT INTO recipe_templates (name, category, description, membership_level, difficulty, cuisine_type, meal_type, sort_order) VALUES
('Middag för två', 'Romantisk', 'Perfekt för en mysig middag hemma', 'silver', 'medel', 'fusion', 'middag', 1),
('Barnvänlig veckomiddag', 'Familj', 'Enkel och omtyckt av barn', 'silver', 'enkel', 'svensk', 'middag', 2),
('Snabbt & enkelt', 'Vardagsmiddag', 'Klar på 30 minuter', 'silver', 'enkel', 'fusion', 'lunch', 3),
('Vegansk delight', 'Vegetarisk', 'Hälsosam och god vegansk rätt', 'silver', 'medel', 'asiatisk', 'middag', 4),
('Söndagslunch', 'Helgmat', 'Traditionell svensk söndagslunch', 'silver', 'medel', 'svensk', 'lunch', 5),
('Fredagsmys', 'Comfort food', 'Perfekt till filmkväll', 'silver', 'enkel', 'amerikansk', 'middag', 6),
('Lågkolhydrat måltid', 'Hälsa', 'LCHF-vänlig måltid', 'silver', 'medel', 'medelhav', 'middag', 7),
('Festlig buffé', 'Fest', 'Imponera på gästerna', 'silver', 'avancerad', 'fusion', 'festmat', 8),
('Studentmat', 'Budget', 'Billigt och gott', 'silver', 'enkel', 'fusion', 'middag', 9),
('Picknickfavorit', 'Utomhus', 'Ta med på picknick', 'silver', 'enkel', 'svensk', 'lunch', 10);

-- Insert recipe templates for Gold members (additional 10 templates, total 20)
INSERT INTO recipe_templates (name, category, description, membership_level, difficulty, cuisine_type, meal_type, sort_order) VALUES
('Gourmet trerätters', 'Finmiddag', 'Restaurangkvalitet hemma', 'gold', 'avancerad', 'fransk', 'festmat', 11),
('Asiatisk fusion', 'Modern', 'Nytänkande asiatisk mat', 'gold', 'avancerad', 'fusion', 'middag', 12),
('Julbord klassiker', 'Högtid', 'Traditionell julmat', 'gold', 'medel', 'svensk', 'festmat', 13),
('Midsommarfest', 'Högtid', 'Perfekt till midsommar', 'gold', 'medel', 'svensk', 'festmat', 14),
('Raw food bowl', 'Hälsa', 'Näringsrik raw food', 'gold', 'enkel', 'fusion', 'lunch', 15),
('Glutenfri gourmet', 'Specialkost', 'Avancerad glutenfri rätt', 'gold', 'avancerad', 'italiensk', 'middag', 16),
('Tapas-tallrik', 'Mingel', 'Spanska smaker', 'gold', 'medel', 'spansk', 'mellanmal', 17),
('Sushi-mästare', 'Asiatisk', 'Hemmagjord sushi', 'gold', 'avancerad', 'japansk', 'middag', 18),
('Vegansk bakelse', 'Bakverk', 'Lyxig vegansk dessert', 'gold', 'avancerad', 'fusion', 'efterratt', 19),
('BBQ-mästare', 'Grill', 'Amerikanskt BBQ', 'gold', 'medel', 'amerikansk', 'middag', 20);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_details_product_id ON recipe_details(product_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_detail_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON recipe_steps(recipe_detail_id);
CREATE INDEX IF NOT EXISTS idx_recipe_media_recipe_id ON recipe_media(recipe_detail_id);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_membership ON recipe_templates(membership_level, is_active);
