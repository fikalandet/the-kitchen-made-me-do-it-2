/*
  # Skapa system för "Om oss"-sidan

  1. Ny tabell: about_page
    - `id` (uuid, primary key)
    - Toppsektion:
      - `background_type` (text) - 'color' eller 'image'
      - `background_color` (text)
      - `background_image` (text, nullable)
      - `title_text` (text)
      - `title_font` (text, default 'poppins')
      - `title_weight` (text, default 'bold')
      - `title_size` (text, default 'xl')
      - `title_color` (text, default '#000000')
      - `title_align` (text, default 'center')
      - `tagline_text` (text, nullable)
      - `ingress_text` (text, nullable)
      - `hero_image` (text, nullable)
      - `hero_image_position` (text, default 'below_title') - 'above_title' eller 'below_title'
      - `container_mode` (text, default 'contained') - 'contained' eller 'full-width'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Ny tabell: about_page_rows
    - `id` (uuid, primary key)
    - `row_order` (int) - 1, 2 eller 3
    - `row_title` (text)
    - `row_text` (text)
    - `row_image` (text, nullable)
    - `image_shape` (text, default 'rounded') - 'rounded' eller 'circle'
    - `image_border` (boolean, default false)
    - `image_border_color` (text, default '#a1c798')
    - `row_layout` (text, default 'text-image') - för framtida flexibilitet
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. Ny tabell: about_page_values_cards
    - `id` (uuid, primary key)
    - `card_order` (int)
    - `settings` (jsonb) - hero-kort-inställningar
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  4. Ny tabell: about_page_discover_cards
    - `id` (uuid, primary key)
    - `card_order` (int)
    - `settings` (jsonb) - hero-kort-inställningar
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  5. Ny tabell: about_page_sections_settings
    - `id` (uuid, primary key)
    - `section_key` (text, unique) - 'values' eller 'discover'
    - `section_title` (text)
    - `section_tagline` (text, nullable)
    - `section_ingress` (text, nullable)
    - `show_section` (boolean, default true)
    - `title_font` (text, default 'poppins')
    - `title_size` (text, default 'xl')
    - `title_color` (text, default '#000000')
    - `title_align` (text, default 'center')
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  6. Säkerhet
    - Enable RLS
    - Policies för offentlig läsning
    - Policies för admin att skapa/uppdatera
*/

-- Skapa about_page-tabell
CREATE TABLE IF NOT EXISTS about_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_type text DEFAULT 'color',
  background_color text DEFAULT '#f6f2e0',
  background_image text,
  title_text text DEFAULT 'Om oss',
  title_font text DEFAULT 'poppins',
  title_weight text DEFAULT 'bold',
  title_size text DEFAULT 'xl',
  title_color text DEFAULT '#000000',
  title_align text DEFAULT 'center',
  tagline_text text,
  ingress_text text,
  hero_image text,
  hero_image_position text DEFAULT 'below_title',
  container_mode text DEFAULT 'contained',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skapa about_page_rows-tabell
CREATE TABLE IF NOT EXISTS about_page_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_order int NOT NULL,
  row_title text DEFAULT '',
  row_text text DEFAULT '',
  row_image text,
  image_shape text DEFAULT 'rounded',
  image_border boolean DEFAULT false,
  image_border_color text DEFAULT '#a1c798',
  row_layout text DEFAULT 'text-image',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(row_order)
);

-- Skapa about_page_values_cards-tabell
CREATE TABLE IF NOT EXISTS about_page_values_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_order int NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skapa about_page_discover_cards-tabell
CREATE TABLE IF NOT EXISTS about_page_discover_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_order int NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skapa about_page_sections_settings-tabell
CREATE TABLE IF NOT EXISTS about_page_sections_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_title text DEFAULT '',
  section_tagline text,
  section_ingress text,
  show_section boolean DEFAULT true,
  title_font text DEFAULT 'poppins',
  title_size text DEFAULT 'xl',
  title_color text DEFAULT '#000000',
  title_align text DEFAULT 'center',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page_values_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page_discover_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page_sections_settings ENABLE ROW LEVEL SECURITY;

-- Policy för att alla kan läsa
CREATE POLICY "Anyone can read about page"
  ON about_page FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read about page rows"
  ON about_page_rows FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read about page values cards"
  ON about_page_values_cards FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read about page discover cards"
  ON about_page_discover_cards FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read about page sections settings"
  ON about_page_sections_settings FOR SELECT
  USING (true);

-- Policy för admins att uppdatera
CREATE POLICY "Admins can update about page"
  ON about_page FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert about page"
  ON about_page FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update about page rows"
  ON about_page_rows FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert about page rows"
  ON about_page_rows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete about page rows"
  ON about_page_rows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update about page values cards"
  ON about_page_values_cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert about page values cards"
  ON about_page_values_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete about page values cards"
  ON about_page_values_cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update about page discover cards"
  ON about_page_discover_cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert about page discover cards"
  ON about_page_discover_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete about page discover cards"
  ON about_page_discover_cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update about page sections settings"
  ON about_page_sections_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert about page sections settings"
  ON about_page_sections_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_about_page_rows_order ON about_page_rows(row_order);
CREATE INDEX IF NOT EXISTS idx_about_page_values_cards_order ON about_page_values_cards(card_order);
CREATE INDEX IF NOT EXISTS idx_about_page_discover_cards_order ON about_page_discover_cards(card_order);
CREATE INDEX IF NOT EXISTS idx_about_page_sections_key ON about_page_sections_settings(section_key);

-- Funktion för att automatiskt uppdatera updated_at
CREATE OR REPLACE FUNCTION update_about_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers för updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_page_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_about_page_updated_at_trigger
      BEFORE UPDATE ON about_page
      FOR EACH ROW
      EXECUTE FUNCTION update_about_page_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_page_rows_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_about_page_rows_updated_at_trigger
      BEFORE UPDATE ON about_page_rows
      FOR EACH ROW
      EXECUTE FUNCTION update_about_page_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_page_values_cards_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_about_page_values_cards_updated_at_trigger
      BEFORE UPDATE ON about_page_values_cards
      FOR EACH ROW
      EXECUTE FUNCTION update_about_page_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_page_discover_cards_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_about_page_discover_cards_updated_at_trigger
      BEFORE UPDATE ON about_page_discover_cards
      FOR EACH ROW
      EXECUTE FUNCTION update_about_page_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_about_page_sections_settings_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_about_page_sections_settings_updated_at_trigger
      BEFORE UPDATE ON about_page_sections_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_about_page_updated_at();
  END IF;
END $$;

-- Seed-data: Skapa grundinställningar för Om oss-sidan
INSERT INTO about_page (
  background_type,
  background_color,
  title_text,
  title_font,
  title_size,
  title_color,
  title_align,
  tagline_text,
  ingress_text,
  hero_image_position,
  container_mode
) VALUES (
  'color',
  '#f6f2e0',
  'Om oss',
  'lobster',
  '2xl',
  '#000000',
  'center',
  'Välkommen till The Kitchen',
  'Vi är en plattform som förenar kökspassionerade kockar med matälskare.',
  'below_title',
  'contained'
) ON CONFLICT DO NOTHING;

-- Seed-data: Skapa 3 rader för 2-kolumnersblock
INSERT INTO about_page_rows (row_order, row_title, row_text, image_shape, image_border, row_layout) VALUES
  (1, 'Vår historia', 'The Kitchen startades med en vision om att skapa en plattform där passionerade kockar kan dela sin matglede med matälskare.', 'rounded', false, 'text-image'),
  (2, 'Vad vi gör', 'Vi skapar en mötesplats där lokala kockar kan erbjuda sina specialiteter direkt till kunder i närområdet.', 'rounded', false, 'image-text'),
  (3, 'Vårt uppdrag', 'Att demokratisera matupplevelser och göra det enkelt för alla att njuta av hemlagad mat av hög kvalitet.', 'rounded', false, 'text-image')
ON CONFLICT (row_order) DO NOTHING;

-- Seed-data: Skapa sektionsinställningar för "Våra värderingar"
INSERT INTO about_page_sections_settings (
  section_key,
  section_title,
  section_tagline,
  section_ingress,
  show_section,
  title_font,
  title_size,
  title_color,
  title_align
) VALUES (
  'values',
  'Våra värderingar',
  'Detta är vad vi står för',
  'Här är de grundläggande värderingar som driver oss framåt varje dag.',
  true,
  'lobster',
  'xl',
  '#000000',
  'center'
) ON CONFLICT (section_key) DO NOTHING;

-- Seed-data: Skapa sektionsinställningar för "Upptäck The Kitchen"
INSERT INTO about_page_sections_settings (
  section_key,
  section_title,
  section_tagline,
  section_ingress,
  show_section,
  title_font,
  title_size,
  title_color,
  title_align
) VALUES (
  'discover',
  'Upptäck The Kitchen',
  'Utforska vår plattform',
  'Kom igång med The Kitchen och upptäck allt vi har att erbjuda.',
  true,
  'lobster',
  'xl',
  '#000000',
  'center'
) ON CONFLICT (section_key) DO NOTHING;

-- Seed-data: Skapa exempel-hero-kort för "Våra värderingar"
INSERT INTO about_page_values_cards (card_order, settings) VALUES
  (1, '{"id": "values-1", "heading": "Kvalitet", "text": "Vi tror på högsta kvalitet i allt vi gör.", "imageUrl": "", "imageAlt": "Kvalitet", "cardBackgroundColor": "#a1c798", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#ffffff", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#ffffff", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb),
  (2, '{"id": "values-2", "heading": "Gemenskap", "text": "Vi bygger en stark gemenskap av matälskare.", "imageUrl": "", "imageAlt": "Gemenskap", "cardBackgroundColor": "#56c5c5", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#ffffff", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#ffffff", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb),
  (3, '{"id": "values-3", "heading": "Hållbarhet", "text": "Vi arbetar för en hållbar framtid.", "imageUrl": "", "imageAlt": "Hållbarhet", "cardBackgroundColor": "#f6f2e0", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#000000", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#000000", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed-data: Skapa exempel-hero-kort för "Upptäck The Kitchen"
INSERT INTO about_page_discover_cards (card_order, settings) VALUES
  (1, '{"id": "discover-1", "heading": "Hitta käk", "text": "Utforska tusentals rätter från lokala kockar.", "imageUrl": "", "imageAlt": "Hitta käk", "cardBackgroundColor": "#a1c798", "ctaLabel": "Börja utforska", "ctaUrl": "/hitta-kak", "ctaLinkType": "internal", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#ffffff", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#ffffff", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb),
  (2, '{"id": "discover-2", "heading": "Bli kock", "text": "Dela din passion för mat och tjäna pengar.", "imageUrl": "", "imageAlt": "Bli kock", "cardBackgroundColor": "#56c5c5", "ctaLabel": "Läs mer", "ctaUrl": "/bli-kock", "ctaLinkType": "internal", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#ffffff", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#ffffff", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb),
  (3, '{"id": "discover-3", "heading": "Medlemskap", "text": "Få tillgång till exklusiva fördelar.", "imageUrl": "", "imageAlt": "Medlemskap", "cardBackgroundColor": "#f6f2e0", "ctaLabel": "Se fördelar", "ctaUrl": "/membership", "ctaLinkType": "internal", "headingStyle": {"fontFamily": "lobster", "fontSize": "lg", "bold": true, "textColor": "#000000", "textAlign": "center"}, "textStyle": {"fontFamily": "poppins", "fontSize": "md", "textColor": "#000000", "textAlign": "center"}, "horizontalPosition": "center", "verticalPosition": "center"}'::jsonb)
ON CONFLICT DO NOTHING;
