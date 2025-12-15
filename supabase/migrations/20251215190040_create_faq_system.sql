/*
  # Skapa FAQ-system med kategorier och frågor

  1. Nya tabeller
    - `faq_page` - sidinställningar (rubrik, textrader, ingress med typografi)
    - `faq_categories` - FAQ-kategorier med styling
    - `faq_items` - individuella frågor och svar per kategori

  2. Fält i faq_page
    - title_text, title_font, title_weight, title_size, title_color, title_align
    - text_lines (JSONB med rotator)
    - tagline_font, tagline_weight, tagline_size, tagline_color, tagline_align
    - ingress_text, ingress_font, ingress_weight, ingress_size, ingress_color, ingress_align
    - background_type, background_color, background_image

  3. Fält i faq_categories
    - title
    - styles (JSONB med font, weight, size, color, align, background_color, icon)
    - order_index
    - is_published

  4. Fält i faq_items
    - category_id
    - question
    - answer
    - order_index
    - is_published
    - question_styles (JSONB)
    - answer_styles (JSONB)

  5. Säkerhet
    - RLS enabled på alla tabeller
    - Public read access för published content
    - Admin write access
*/

-- FAQ Page settings
CREATE TABLE IF NOT EXISTS faq_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_text text NOT NULL DEFAULT 'Vanliga frågor',
  title_font text NOT NULL DEFAULT 'lobster',
  title_weight text NOT NULL DEFAULT 'bold',
  title_size text NOT NULL DEFAULT 'xl',
  title_color text NOT NULL DEFAULT '#000000',
  title_align text NOT NULL DEFAULT 'center',
  text_lines jsonb DEFAULT '{"lines": [], "rotate": false, "interval_seconds": 10, "placement": "after_heading"}'::jsonb,
  tagline_font text NOT NULL DEFAULT 'poppins',
  tagline_weight text NOT NULL DEFAULT 'normal',
  tagline_size text NOT NULL DEFAULT 'lg',
  tagline_color text NOT NULL DEFAULT '#374151',
  tagline_align text NOT NULL DEFAULT 'center',
  ingress_text text,
  ingress_font text NOT NULL DEFAULT 'poppins',
  ingress_weight text NOT NULL DEFAULT 'normal',
  ingress_size text NOT NULL DEFAULT 'lg',
  ingress_color text NOT NULL DEFAULT '#374151',
  ingress_align text NOT NULL DEFAULT 'center',
  background_type text NOT NULL DEFAULT 'color',
  background_color text NOT NULL DEFAULT '#f6f2e0',
  background_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_page ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FAQ page visible to all"
  ON faq_page FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can update FAQ page"
  ON faq_page FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert FAQ page"
  ON faq_page FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  styles jsonb DEFAULT '{
    "font": "poppins",
    "weight": "semibold",
    "size": "lg",
    "color": "#000000",
    "align": "center",
    "background_color": "#ffffff",
    "icon": null
  }'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published FAQ categories visible to all"
  ON faq_categories FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admins can view all FAQ categories"
  ON faq_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert FAQ categories"
  ON faq_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update FAQ categories"
  ON faq_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete FAQ categories"
  ON faq_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- FAQ Items (questions and answers)
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published FAQ items visible to all"
  ON faq_items FOR SELECT
  TO public
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM faq_categories
      WHERE faq_categories.id = faq_items.category_id
      AND faq_categories.is_published = true
    )
  );

CREATE POLICY "Admins can view all FAQ items"
  ON faq_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert FAQ items"
  ON faq_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update FAQ items"
  ON faq_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete FAQ items"
  ON faq_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_categories_order ON faq_categories(order_index);
CREATE INDEX IF NOT EXISTS idx_faq_categories_published ON faq_categories(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_order ON faq_items(order_index);
CREATE INDEX IF NOT EXISTS idx_faq_items_published ON faq_items(is_published);

-- Insert default page settings
INSERT INTO faq_page (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
