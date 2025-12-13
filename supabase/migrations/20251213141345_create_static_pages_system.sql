/*
  # Skapa system för statiska sidor

  1. Ny tabell: static_pages
    - `id` (uuid, primary key)
    - `slug` (text, unique) - URL-slug för sidan (t.ex. "om-oss")
    - `title` (text) - Sidrubrik (H1)
    - `intro` (text, nullable) - Ingress/introtext
    - `content` (jsonb, default '[]') - Flexibelt innehållsblock med olika blocktyper
    - `cta_enabled` (boolean, default false) - Om CTA-block ska visas
    - `cta_text` (text, nullable) - CTA-knapptext
    - `cta_link` (text, nullable) - CTA-länk
    - `is_published` (boolean, default false) - Publicerad eller ej
    - `show_in_menu` (boolean, default false) - Visas i huvudmenyn
    - `menu_order` (int, nullable) - Ordning i menyn
    - `page_type` (text, default 'standard') - Typ: standard, editorial_category, policy
    - `meta_description` (text, nullable) - SEO meta description
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Säkerhet
    - Enable RLS
    - Policies för offentlig läsning av publicerade sidor
    - Policies för admin att skapa/uppdatera/radera
*/

-- Skapa static_pages-tabell
CREATE TABLE IF NOT EXISTS static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  intro text,
  content jsonb DEFAULT '[]'::jsonb,
  cta_enabled boolean DEFAULT false,
  cta_text text,
  cta_link text,
  is_published boolean DEFAULT false,
  show_in_menu boolean DEFAULT false,
  menu_order int,
  page_type text DEFAULT 'standard',
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Policy för att alla kan läsa publicerade sidor
CREATE POLICY "Anyone can read published static pages"
  ON static_pages FOR SELECT
  USING (is_published = true);

-- Policy för admins att läsa alla sidor
CREATE POLICY "Admins can read all static pages"
  ON static_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy för admins att skapa nya sidor
CREATE POLICY "Admins can insert static pages"
  ON static_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy för admins att uppdatera sidor
CREATE POLICY "Admins can update static pages"
  ON static_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy för admins att radera sidor
CREATE POLICY "Admins can delete static pages"
  ON static_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_static_pages_menu ON static_pages(show_in_menu, menu_order);
CREATE INDEX IF NOT EXISTS idx_static_pages_type ON static_pages(page_type);

-- Funktion för att automatiskt uppdatera updated_at
CREATE OR REPLACE FUNCTION update_static_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger för updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_static_pages_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_static_pages_updated_at_trigger
      BEFORE UPDATE ON static_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_static_pages_updated_at();
  END IF;
END $$;

-- Seed-data: Alla statiska sidor med placeholder-innehåll
INSERT INTO static_pages (slug, title, intro, page_type, is_published) VALUES
  ('om-oss', 'Om oss', 'Här kommer innehåll om vår plattform och vårt uppdrag...', 'standard', false),
  ('kontakta-oss', 'Kontakta oss', 'Här kommer kontaktinformation och formulär...', 'standard', false),
  ('samarbeten', 'Samarbeten', 'Här kommer information om våra samarbeten...', 'standard', false),
  ('sa-funkar-det', 'Så funkar det', 'Här kommer en guide för hur plattformen fungerar...', 'standard', false),
  ('faq', 'Vanliga frågor (FAQ)', 'Här kommer svar på de vanligaste frågorna...', 'standard', false),
  ('blogg', 'Blogg', 'Här kommer våra senaste artiklar och inlägg...', 'standard', false),
  ('vara-kockar', 'Våra kockar', 'Här kommer översikt av alla våra duktiga kockar...', 'standard', false),
  ('kock-i-fokus', 'Kock i fokus', 'Här presenteras utvalda kockar mer ingående...', 'standard', false),
  ('guldskeden', 'Guldskeden', 'Här kommer information om Guldskeden-utmärkelsen...', 'standard', false),
  ('butik', 'Butik', 'Här kommer produkter och artiklar att köpa...', 'standard', false),
  ('policys-villkor', 'Policys & villkor', 'Här samlar vi alla policys och villkor på en plats...', 'policy', false),
  ('hallbarhet', 'Hållbarhet / Vårt ansvar', 'Här kommer information om vårt hållbarhetsarbete...', 'standard', false),
  ('press', 'Press / Media', 'Här finns pressmaterial och kontaktuppgifter för media...', 'standard', false)
ON CONFLICT (slug) DO NOTHING;

-- Redaktionella kategorier
INSERT INTO static_pages (slug, title, intro, page_type, is_published) VALUES
  ('halsokak', 'Hälsokäk', 'Denna sida byggs just nu...', 'editorial_category', false),
  ('en-sked-for-mamma', 'En sked för mamma', 'Denna sida byggs just nu...', 'editorial_category', false),
  ('koksknep', 'Köksknep', 'Denna sida byggs just nu...', 'editorial_category', false),
  ('vardagsmat', 'Vardagsmat', 'Denna sida byggs just nu...', 'editorial_category', false),
  ('for-hela-familjen', 'För hela familjen', 'Denna sida byggs just nu...', 'editorial_category', false)
ON CONFLICT (slug) DO NOTHING;
