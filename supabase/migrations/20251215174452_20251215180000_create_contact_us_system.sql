/*
  # Skapa "Kontakta oss"-sida och ärendesystem

  1. Ny tabell: contact_us_page
    - Innehåller alla inställningar för Kontakta oss-sidan
    - Bild, rubrik med typografi, roterande textrader, ingress med typografi, bakgrund

  2. Ny tabell: contact_tickets
    - Sparar alla kontaktärenden från formuläret
    - Stöd för både inloggade och icke-inloggade användare
    - Inkluderar alla fält: namn, kund-ID, e-post, telefon, ämne, meddelande
    - Status för ärendehantering

  3. Säkerhet
    - Enable RLS på båda tabeller
    - Policies för att skapa ärenden (alla)
    - Policies för admin att läsa/uppdatera ärenden
    - Policies för admin att redigera sidan
*/

-- ========================================
-- TABELL: contact_us_page
-- ========================================

CREATE TABLE IF NOT EXISTS contact_us_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Bild
  image_url text,

  -- Rubrik med typografi
  title_text text NOT NULL DEFAULT 'Kontakta oss',
  title_font text NOT NULL DEFAULT 'lobster',
  title_weight text NOT NULL DEFAULT 'bold',
  title_size text NOT NULL DEFAULT 'xl',
  title_color text NOT NULL DEFAULT '#000000',
  title_align text NOT NULL DEFAULT 'center',

  -- Roterande textrader (jsonb med TextLines-struktur)
  text_lines jsonb DEFAULT '{"lines": [], "rotate": false, "interval_seconds": 10, "placement": "after_heading"}'::jsonb,

  -- Ingress med typografi
  ingress_text text,
  ingress_font text NOT NULL DEFAULT 'poppins',
  ingress_weight text NOT NULL DEFAULT 'normal',
  ingress_size text NOT NULL DEFAULT 'lg',
  ingress_color text NOT NULL DEFAULT '#374151',
  ingress_align text NOT NULL DEFAULT 'center',

  -- Bakgrund
  background_type text NOT NULL DEFAULT 'color',
  background_color text NOT NULL DEFAULT '#f6f2e0',
  background_image text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_us_page ENABLE ROW LEVEL SECURITY;

-- Policy: Alla kan läsa sidan (publik)
CREATE POLICY "Anyone can read contact_us_page"
  ON contact_us_page FOR SELECT
  USING (true);

-- Policy: Admins kan uppdatera sidan
CREATE POLICY "Admins can update contact_us_page"
  ON contact_us_page FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Admins kan skapa sidan
CREATE POLICY "Admins can insert contact_us_page"
  ON contact_us_page FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Skapa default-rad för contact_us_page
INSERT INTO contact_us_page (
  title_text,
  text_lines,
  ingress_text
) VALUES (
  'Kontakta oss',
  '{"lines": ["Vi finns här för dig", "Tveka inte att höra av dig", "Vi svarar inom 24 timmar"], "rotate": true, "interval_seconds": 10, "placement": "after_heading"}'::jsonb,
  'Har du frågor eller funderingar? Fyll i formuläret nedan så återkommer vi så snart vi kan.'
) ON CONFLICT DO NOTHING;

-- ========================================
-- TABELL: contact_tickets
-- ========================================

CREATE TABLE IF NOT EXISTS contact_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Användare
  user_id uuid REFERENCES auth.users(id),
  customer_id text,

  -- Kontaktinformation
  name text NOT NULL,
  email text NOT NULL,
  phone text,

  -- Ärende
  subject text NOT NULL,
  message text NOT NULL,

  -- Status och metadata
  status text NOT NULL DEFAULT 'new',
  source_page text NOT NULL DEFAULT 'contact_us',

  -- Honeypot för spam-skydd (osynligt fält)
  honeypot text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contact_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Alla kan skapa ärenden
CREATE POLICY "Anyone can create contact tickets"
  ON contact_tickets FOR INSERT
  WITH CHECK (true);

-- Policy: Admins kan läsa alla ärenden
CREATE POLICY "Admins can read all contact tickets"
  ON contact_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy: Användare kan läsa sina egna ärenden
CREATE POLICY "Users can read own contact tickets"
  ON contact_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins kan uppdatera ärenden (status, etc.)
CREATE POLICY "Admins can update contact tickets"
  ON contact_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_contact_tickets_user_id ON contact_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_tickets_status ON contact_tickets(status);
CREATE INDEX IF NOT EXISTS idx_contact_tickets_created_at ON contact_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_tickets_subject ON contact_tickets(subject);

-- Funktion för att automatiskt uppdatera updated_at
CREATE OR REPLACE FUNCTION update_contact_us_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contact_tickets_updated_at()
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_us_page_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_contact_us_page_updated_at_trigger
      BEFORE UPDATE ON contact_us_page
      FOR EACH ROW
      EXECUTE FUNCTION update_contact_us_page_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_contact_tickets_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_contact_tickets_updated_at_trigger
      BEFORE UPDATE ON contact_tickets
      FOR EACH ROW
      EXECUTE FUNCTION update_contact_tickets_updated_at();
  END IF;
END $$;
