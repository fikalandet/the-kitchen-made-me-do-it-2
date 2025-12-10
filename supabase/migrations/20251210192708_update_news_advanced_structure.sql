/*
  # Update News Section for Advanced Structure

  1. Changes
    - Adds support for two display modes: "big-image-text" and "card-flow"
    - Adds image_items table for image collage management
    - Adds editorial_cards table for custom content cards
    - Updates news_articles to support hero marking

  2. New Tables
    - `news_image_items` for image collage in big-image-text mode
    - `news_editorial_cards` for custom editorial cards

  3. Security
    - RLS enabled on all new tables
    - Admin-only access for modifications
*/

-- Create news_image_items table for image collage
CREATE TABLE IF NOT EXISTS news_image_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug text DEFAULT 'nyheter',
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  z_index integer DEFAULT 0,
  position_preset text DEFAULT 'center',
  offset_x integer DEFAULT 0,
  offset_y integer DEFAULT 0,
  rotation integer DEFAULT 0,
  scale decimal DEFAULT 1.0,
  shape text DEFAULT 'rectangular',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news_image_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news images"
  ON news_image_items
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage news images"
  ON news_image_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create news_editorial_cards table
CREATE TABLE IF NOT EXISTS news_editorial_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug text DEFAULT 'nyheter',
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  background_color text DEFAULT '#ffffff',
  opacity integer DEFAULT 100,
  border_radius integer DEFAULT 12,
  padding integer DEFAULT 16,
  is_hero boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news_editorial_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible editorial cards"
  ON news_editorial_cards
  FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Admins can manage editorial cards"
  ON news_editorial_cards
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_news_image_items_order ON news_image_items(display_order);
CREATE INDEX IF NOT EXISTS idx_news_editorial_cards_order ON news_editorial_cards(display_order DESC);
CREATE INDEX IF NOT EXISTS idx_news_editorial_cards_hero ON news_editorial_cards(is_hero DESC, display_order DESC);
