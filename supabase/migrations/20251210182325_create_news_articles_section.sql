/*
  # Create News Articles System

  1. New Tables
    - `news_articles`
      - `id` (uuid, primary key)
      - `title` (text) - Article headline
      - `ingress` (text) - Short description
      - `main_image_url` (text) - Primary article image
      - `full_text` (text) - Full article content
      - `link_url` (text) - Internal or external link
      - `category_tag` (text) - Category like "Plattformen", "Event", "Mattrend"
      - `is_featured` (boolean) - Shows as larger card
      - `is_hidden` (boolean) - Hidden without deletion
      - `display_order` (integer) - Sort order
      - `created_by` (uuid) - Admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Section Settings
    - Creates 'nyheter' section in site_sections

  3. Security
    - Enable RLS on news_articles table
    - Public can view visible articles
    - Only admins can create/update/delete articles
*/

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  ingress text,
  main_image_url text,
  full_text text,
  link_url text,
  category_tag text,
  is_featured boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Public can view visible articles
CREATE POLICY "Anyone can view visible news articles"
  ON news_articles
  FOR SELECT
  USING (is_hidden = false);

-- Admins can view all articles
CREATE POLICY "Admins can view all news articles"
  ON news_articles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can insert articles
CREATE POLICY "Admins can create news articles"
  ON news_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update articles
CREATE POLICY "Admins can update news articles"
  ON news_articles
  FOR UPDATE
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

-- Admins can delete articles
CREATE POLICY "Admins can delete news articles"
  ON news_articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create index for display order and featured status
CREATE INDEX IF NOT EXISTS idx_news_articles_display_order ON news_articles(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON news_articles(is_featured DESC, display_order DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_hidden ON news_articles(is_hidden, display_order DESC);

-- Insert nyheter section settings
INSERT INTO site_sections (name, slug, settings, design, data_source_type, data_source_config, order_index, visible)
VALUES (
  'Nyheter',
  'nyheter',
  jsonb_build_object(
    'backgroundColor', '#ffffff',
    'heading', 'Nyheter',
    'headingFont', 'lobster',
    'headingFontSize', 32,
    'headingBold', false,
    'headingAlignment', 'center',
    'headingColor', '#374151',
    'headingEmojiPrefix', '',
    'headingEmojiSuffix', '',
    'subtitleTexts', jsonb_build_array('Senaste nytt från Plattformen'),
    'subtitleRotationInterval', 10000,
    'subtitlePlacement', 'inline',
    'subtitleFont', 'sans',
    'subtitleFontSize', 16,
    'subtitleColor', '#6b7280',
    'subtitleBold', false,
    'subtitleItalic', false,
    'displayMode', 'standard',
    'newsToShow', 6,
    'layoutForm', 'grid',
    'featuredCardLarger', true,
    'featuredCardSize', '1.5x',
    'ctaButtons', jsonb_build_array(),
    'sectionPaddingTop', 12,
    'sectionPaddingBottom', 12
  ),
  '{}',
  'manual',
  '{}',
  50,
  true
)
ON CONFLICT (slug) DO NOTHING;
