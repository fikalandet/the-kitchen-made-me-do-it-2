/*
  # Create Editorial Categories System

  1. New Tables
    - `editorial_categories`
      - `id` (uuid, primary key)
      - `title` (text) - Category title (e.g., "En sked för mamma", "Hälsokäk")
      - `slug` (text, unique) - URL-friendly identifier (e.g., "en-sked-for-mamma")
      - `description` (text) - Short description/pitch for the category card
      - `image_url` (text) - Category card image
      - `cta_text` (text) - Call-to-action text (e.g., "Läs mer", "Utforska")
      - `is_featured` (boolean) - Whether this category should be prominently displayed
      - `background_color` (text) - Optional background/accent color for the card
      - `category_type` (text) - Optional category type (e.g., "Mamma", "Hälsa", "Barn & familj")
      - `display_order` (integer) - Sort order for displaying categories
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `editorial_articles`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to editorial_categories)
      - `title` (text) - Article title
      - `slug` (text) - URL-friendly identifier
      - `ingress` (text) - Short introduction text
      - `body` (text) - Full article content
      - `image_url` (text) - Article image
      - `product_link` (uuid, nullable) - Optional link to a product
      - `cta_text` (text) - Optional CTA text
      - `cta_link` (text) - Optional CTA link
      - `display_order` (integer) - Sort order within category
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Admins can manage all content
    - Users can read all visible content

  3. Initial Data
    - Add the "Redaktionella kategorier" section to site_sections
    - Insert some example categories
*/

-- Create editorial_categories table
CREATE TABLE IF NOT EXISTS editorial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  cta_text text DEFAULT 'Läs mer',
  is_featured boolean DEFAULT false,
  background_color text DEFAULT '#ffffff',
  category_type text DEFAULT '',
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create editorial_articles table
CREATE TABLE IF NOT EXISTS editorial_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES editorial_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  ingress text DEFAULT '',
  body text DEFAULT '',
  image_url text DEFAULT '',
  product_link uuid REFERENCES products(id) ON DELETE SET NULL,
  cta_text text DEFAULT '',
  cta_link text DEFAULT '',
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE editorial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_articles ENABLE ROW LEVEL SECURITY;

-- Policies for editorial_categories
CREATE POLICY "Admins can manage editorial categories"
  ON editorial_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can read editorial categories"
  ON editorial_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for editorial_articles
CREATE POLICY "Admins can manage editorial articles"
  ON editorial_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can read editorial articles"
  ON editorial_articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_editorial_categories_slug ON editorial_categories(slug);
CREATE INDEX IF NOT EXISTS idx_editorial_categories_order ON editorial_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_editorial_articles_category ON editorial_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_editorial_articles_order ON editorial_articles(display_order);

-- Add the section to site_sections
INSERT INTO site_sections (name, slug, settings, design, order_index, visible) VALUES
  ('Redaktionella kategorier', 'redaktionella-kategorier', '{}'::jsonb, '{}'::jsonb, 23, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert some example categories (optional)
INSERT INTO editorial_categories (title, slug, description, cta_text, display_order, is_featured) VALUES
  ('En sked för mamma', 'en-sked-for-mamma', 'Tips och inspiration för föräldrar', 'Utforska', 1, true),
  ('Hälsokäk', 'halsokak', 'Näringsrik mat för en hälsosam livsstil', 'Läs mer', 2, false),
  ('Barn & familj', 'barn-familj', 'Maträtter som hela familjen älskar', 'Se recept', 3, false),
  ('Studentkök', 'studentkok', 'Snabb, billig och god mat för studenter', 'Kom igång', 4, false),
  ('Vegohörnan', 'vegohornan', 'Vegetariska och veganska rätter', 'Upptäck', 5, false),
  ('Säsong & högtider', 'sasong-hogtider', 'Mat för firanden och högtider', 'Se mer', 6, false)
ON CONFLICT (slug) DO NOTHING;
