/*
  # Skapa system för landningssidor med sektioner

  1. Ny tabell: landing_pages
    - `id` (uuid, primary key)
    - `slug` (text, unique) - URL-slug för sidan (t.ex. "bli-kock")
    - `title` (text) - Sidtitel
    - `meta_description` (text, nullable) - SEO meta description
    - `is_published` (boolean, default false)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Ny tabell: landing_page_sections
    - `id` (uuid, primary key)
    - `landing_page_id` (uuid, foreign key)
    - `section_type` (text) - Typ: hero, navigation_cards, benefits, steps, stories, faq, cta
    - `section_order` (int) - Ordning på sidan
    - `is_visible` (boolean, default true)
    - `background_type` (text, default 'color') - none, color, image
    - `background_color` (text, nullable) - Hex-färg
    - `background_image` (text, nullable) - URL till bild
    - `content` (jsonb) - Flexibelt innehåll per sektionstyp
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. Innehållsstruktur (content jsonb):
    - För alla textfält: { text, font, style, size, alignment, color }
    - Varje sektionstyp har sin egen struktur

  4. Säkerhet
    - Enable RLS
    - Policies för offentlig läsning av publicerade sidor
    - Policies för admin att skapa/uppdatera/radera
*/

-- Skapa landing_pages-tabell
CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  meta_description text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skapa landing_page_sections-tabell
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id uuid NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  section_order int NOT NULL DEFAULT 0,
  is_visible boolean DEFAULT true,
  background_type text DEFAULT 'color',
  background_color text,
  background_image text,
  content jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS på båda tabeller
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

-- Policies för landing_pages
CREATE POLICY "Anyone can read published landing pages"
  ON landing_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can read all landing pages"
  ON landing_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert landing pages"
  ON landing_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update landing pages"
  ON landing_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete landing pages"
  ON landing_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies för landing_page_sections
CREATE POLICY "Anyone can read sections of published landing pages"
  ON landing_page_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages
      WHERE landing_pages.id = landing_page_sections.landing_page_id
      AND landing_pages.is_published = true
    )
  );

CREATE POLICY "Admins can read all sections"
  ON landing_page_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert sections"
  ON landing_page_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update sections"
  ON landing_page_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete sections"
  ON landing_page_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON landing_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_page_id ON landing_page_sections(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_order ON landing_page_sections(landing_page_id, section_order);

-- Trigger för updated_at på landing_pages
CREATE OR REPLACE FUNCTION update_landing_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_landing_pages_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_landing_pages_updated_at_trigger
      BEFORE UPDATE ON landing_pages
      FOR EACH ROW
      EXECUTE FUNCTION update_landing_pages_updated_at();
  END IF;
END $$;

-- Trigger för updated_at på landing_page_sections
CREATE OR REPLACE FUNCTION update_landing_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_landing_page_sections_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_landing_page_sections_updated_at_trigger
      BEFORE UPDATE ON landing_page_sections
      FOR EACH ROW
      EXECUTE FUNCTION update_landing_page_sections_updated_at();
  END IF;
END $$;

-- Skapa "Bli en kock"-landningssidan med exempel-sektioner
DO $$
DECLARE
  page_id uuid;
BEGIN
  -- Skapa sidan
  INSERT INTO landing_pages (slug, title, meta_description, is_published)
  VALUES (
    'bli-kock',
    'Bli en kock på Plattformen',
    'Dela din passion för matlagning och tjäna pengar på det du älskar. Gå med i vår växande gemenskap av hemmakockar.',
    false
  )
  RETURNING id INTO page_id;

  -- SEKTION 1: Hero
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'hero',
    1,
    '#a1c798',
    jsonb_build_object(
      'heading', jsonb_build_object(
        'text', 'Bli kock hos oss',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'xl',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'intro', jsonb_build_object(
        'text', 'Dela din passion för matlagning och tjäna pengar på det du älskar. Gå med i vår växande gemenskap av hemmakockar.',
        'font', 'Poppins',
        'style', 'normal',
        'size', 'm',
        'alignment', 'center',
        'color', '#374151'
      ),
      'cta', jsonb_build_object(
        'text', 'Bli kock hos oss',
        'link', '/login?mode=signup&role=seller',
        'color', '#56c5c5'
      )
    )
  );

  -- SEKTION 2: Navigation Cards
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'navigation_cards',
    2,
    '#f6f2e0',
    jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object(
          'title', 'Så funkar det',
          'icon', 'BookOpen',
          'target_section', 'sa-funkar-det'
        ),
        jsonb_build_object(
          'title', 'Allt du får',
          'icon', 'Gift',
          'target_section', 'fordelar'
        ),
        jsonb_build_object(
          'title', 'Deras resa',
          'icon', 'Users',
          'target_section', 'framgangshistorier'
        )
      )
    )
  );

  -- SEKTION 3: Benefits - Ditt digitala kök
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'benefits',
    3,
    '#ffffff',
    jsonb_build_object(
      'section_id', 'fordelar',
      'heading', jsonb_build_object(
        'text', 'Ditt digitala kök',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'l',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'intro', jsonb_build_object(
        'text', 'Allt du behöver för att lyckas som kock på vår plattform',
        'font', 'Poppins',
        'style', 'normal',
        'size', 'm',
        'alignment', 'center',
        'color', '#6b7280'
      ),
      'cards', jsonb_build_array(
        jsonb_build_object(
          'icon', 'ChefHat',
          'title', 'Enkelt att komma igång',
          'text', 'Skapa ditt kök och börja sälja på bara några minuter'
        ),
        jsonb_build_object(
          'icon', 'Calendar',
          'title', 'Flexibel schemaläggning',
          'text', 'Du bestämmer själv när och hur mycket du vill laga mat'
        ),
        jsonb_build_object(
          'icon', 'DollarSign',
          'title', 'Låg provision',
          'text', 'Börja med 15% och sänk till bara 5% med guldmedlemskap'
        )
      )
    )
  );

  -- SEKTION 4: Steps - Så funkar det
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'steps',
    4,
    '#f6f2e0',
    jsonb_build_object(
      'section_id', 'sa-funkar-det',
      'heading', jsonb_build_object(
        'text', 'Så funkar det',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'l',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'steps', jsonb_build_array(
        jsonb_build_object(
          'icon', 'UserPlus',
          'title', 'Skapa ditt konto',
          'text', 'Registrera dig gratis och fyll i information om ditt kök'
        ),
        jsonb_build_object(
          'icon', 'UtensilsCrossed',
          'title', 'Lägg upp dina rätter',
          'text', 'Ladda upp bilder och beskriv vad du kan laga'
        ),
        jsonb_build_object(
          'icon', 'ShoppingBag',
          'title', 'Ta emot beställningar',
          'text', 'Kunder hittar dig och börjar beställa din mat'
        ),
        jsonb_build_object(
          'icon', 'TrendingUp',
          'title', 'Tjäna pengar',
          'text', 'Få betalt direkt och bygg ditt matimperium'
        )
      )
    )
  );

  -- SEKTION 5: CTA
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'cta',
    5,
    '#a1c798',
    jsonb_build_object(
      'heading', jsonb_build_object(
        'text', 'Redo att börja din resa?',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'l',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'text', jsonb_build_object(
        'text', 'Gå med idag och börja dela din passion för matlagning med hungriga kunder i ditt närområde.',
        'font', 'Poppins',
        'style', 'normal',
        'size', 'm',
        'alignment', 'center',
        'color', '#374151'
      ),
      'cta', jsonb_build_object(
        'text', 'Bli kock hos oss',
        'link', '/login?mode=signup&role=seller',
        'color', '#56c5c5'
      )
    )
  );

  -- SEKTION 6: Stories - Framgångshistorier
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'stories',
    6,
    '#ffffff',
    jsonb_build_object(
      'section_id', 'framgangshistorier',
      'heading', jsonb_build_object(
        'text', 'Deras resa',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'l',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'intro', jsonb_build_object(
        'text', 'Möt några av våra framgångsrika kockar',
        'font', 'Poppins',
        'style', 'normal',
        'size', 'm',
        'alignment', 'center',
        'color', '#6b7280'
      ),
      'stories', jsonb_build_array(
        jsonb_build_object(
          'name', 'Anna, 34',
          'description', 'Småbarnsförälder som ville jobba hemifrån',
          'story', 'Efter att ha varit hemma med mina barn länge ville jag hitta ett sätt att tjäna pengar utan att behöva åka iväg. Nu lagar jag mat på mina egna villkor och tjänar bra pengar samtidigt som jag är hemma med barnen.',
          'image', ''
        ),
        jsonb_build_object(
          'name', 'Mohammed, 45',
          'description', 'Bytte karriär från IT till matlagning',
          'story', 'Efter 20 år i IT-branschen ville jag göra något helt annat. Matlagning har alltid varit min passion och nu kan jag äntligen leva av det jag älskar. Kunderna uppskattar min autentiska husmanskost.',
          'image', ''
        )
      )
    )
  );

  -- SEKTION 7: FAQ
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'faq',
    7,
    '#f6f2e0',
    jsonb_build_object(
      'heading', jsonb_build_object(
        'text', 'Vanliga frågor',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'l',
        'alignment', 'center',
        'color', '#1f2937'
      ),
      'questions', jsonb_build_array(
        jsonb_build_object(
          'question', 'Behöver jag någon utbildning för att bli kock?',
          'answer', 'Nej, du behöver ingen formell utbildning. Vi välkomnar alla som har passion för matlagning och vill dela sina rätter med andra.'
        ),
        jsonb_build_object(
          'question', 'Hur mycket kan jag tjäna?',
          'answer', 'Det beror helt på dig! Många av våra kockar tjänar mellan 5 000-20 000 kr i månaden extra. Ju mer du lagar, desto mer tjänar du.'
        ),
        jsonb_build_object(
          'question', 'Vad kostar det att använda plattformen?',
          'answer', 'Det är gratis att registrera dig och börja sälja. Vi tar endast en provision på dina försäljningar, som börjar på 15% och kan sänkas till 5%.'
        )
      ),
      'link_text', 'Se alla vanliga frågor',
      'link_url', '/faq'
    )
  );

  -- SEKTION 8: Final CTA
  INSERT INTO landing_page_sections (landing_page_id, section_type, section_order, background_color, content)
  VALUES (
    page_id,
    'cta',
    8,
    '#56c5c5',
    jsonb_build_object(
      'heading', jsonb_build_object(
        'text', 'Nu är det din tur',
        'font', 'Lobster',
        'style', 'bold',
        'size', 'xl',
        'alignment', 'center',
        'color', '#ffffff'
      ),
      'text', jsonb_build_object(
        'text', 'Tusentals kunder väntar på att upptäcka din mat. Ta steget idag.',
        'font', 'Poppins',
        'style', 'normal',
        'size', 'm',
        'alignment', 'center',
        'color', '#ffffff'
      ),
      'cta', jsonb_build_object(
        'text', 'Bli kock hos oss',
        'link', '/login?mode=signup&role=seller',
        'color', '#ffffff',
        'text_color', '#56c5c5'
      )
    )
  );

END $$;
