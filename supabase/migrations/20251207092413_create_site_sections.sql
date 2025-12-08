/*
  # Create site_sections table for Webbsidan management

  1. New Tables
    - `site_sections`
      - `id` (uuid, primary key)
      - `name` (text) - Display name of the section (e.g., "Bildspel")
      - `slug` (text, unique) - URL-friendly identifier (e.g., "bildspel")
      - `settings` (jsonb) - Section content settings (heading, subheading, limit, etc.)
      - `design` (jsonb) - Section design settings (colors, layout, etc.)
      - `data_source_type` (text) - Type of data source: manual/automatic/hybrid
      - `data_source_config` (jsonb) - Configuration for data source
      - `order_index` (integer) - Sort order on homepage
      - `visible` (boolean) - Whether section is visible on homepage
      - `visible_from` (timestamptz, nullable) - Optional start date for visibility
      - `visible_to` (timestamptz, nullable) - Optional end date for visibility
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `site_sections` table
    - Add policies for admin users to manage sections
    - Add policy for authenticated users to read visible sections

  3. Initial Data
    - Insert initial row for "Bildspel" section and all other sections from webeditor.md
*/

-- Create site_sections table
CREATE TABLE IF NOT EXISTS site_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb NOT NULL,
  design jsonb DEFAULT '{}'::jsonb NOT NULL,
  data_source_type text DEFAULT 'manual' NOT NULL,
  data_source_config jsonb DEFAULT '{}'::jsonb NOT NULL,
  order_index integer DEFAULT 0 NOT NULL,
  visible boolean DEFAULT true NOT NULL,
  visible_from timestamptz,
  visible_to timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE site_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage site_sections"
  ON site_sections
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

-- Policy: Authenticated users can read visible sections
CREATE POLICY "Users can read visible sections"
  ON site_sections
  FOR SELECT
  TO authenticated
  USING (visible = true);

-- Insert initial data for all sections mentioned in webeditor.md
INSERT INTO site_sections (name, slug, settings, design, order_index) VALUES
  ('Bildspel', 'bildspel', '{"heading": "Välkommen till The Kitchen", "subheading": "", "description": "", "limit": 5, "layoutType": "carousel"}'::jsonb, '{"backgroundColor": "#f6f2e0", "cardBackgroundColor": "#ffffff", "headingColor": "#000000", "textColor": "#000000", "linkColor": "#a1c798"}'::jsonb, 1),
  ('Hero', 'hero', '{}'::jsonb, '{}'::jsonb, 2),
  ('Nyheter', 'nyheter', '{}'::jsonb, '{}'::jsonb, 3),
  ('På spisen nu', 'pa-spisen-nu', '{}'::jsonb, '{}'::jsonb, 4),
  ('Populärt käk', 'populart-kak', '{}'::jsonb, '{}'::jsonb, 5),
  ('Bråttomkäk', 'brattomkak', '{}'::jsonb, '{}'::jsonb, 6),
  ('Nytt på menyn', 'nytt-pa-menyn', '{}'::jsonb, '{}'::jsonb, 7),
  ('Kylskåpsmeny', 'kylskapsmeny', '{}'::jsonb, '{}'::jsonb, 8),
  ('Veckans kockar', 'veckans-kockar', '{}'::jsonb, '{}'::jsonb, 9),
  ('Schyssta deals', 'schyssta-deals', '{}'::jsonb, '{}'::jsonb, 10),
  ('Tjuvkik i köket', 'tjuvkik-i-koket', '{}'::jsonb, '{}'::jsonb, 11),
  ('Hälsokäk', 'halsokak', '{}'::jsonb, '{}'::jsonb, 12),
  ('Humörkäk', 'humorkak', '{}'::jsonb, '{}'::jsonb, 13),
  ('Önska käk', 'onska-kak', '{}'::jsonb, '{}'::jsonb, 14),
  ('Testkäka & Tyck till', 'testkaka-tyck-till', '{}'::jsonb, '{}'::jsonb, 15),
  ('Bli en kitchen-kock', 'bli-kitchen-kock', '{}'::jsonb, '{}'::jsonb, 16),
  ('Så tycker våra kunder', 'kundernas-tyckande', '{}'::jsonb, '{}'::jsonb, 17),
  ('Horoskop', 'horoskop', '{}'::jsonb, '{}'::jsonb, 18),
  ('Evenemang', 'evenemang', '{}'::jsonb, '{}'::jsonb, 19),
  ('Kock i fokus', 'kock-i-fokus', '{}'::jsonb, '{}'::jsonb, 20),
  ('Tävlingar', 'tavlingar', '{}'::jsonb, '{}'::jsonb, 21),
  ('Blogg', 'blogg', '{}'::jsonb, '{}'::jsonb, 22)
ON CONFLICT (slug) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_sections_slug ON site_sections(slug);
CREATE INDEX IF NOT EXISTS idx_site_sections_visible ON site_sections(visible);
CREATE INDEX IF NOT EXISTS idx_site_sections_order ON site_sections(order_index);
