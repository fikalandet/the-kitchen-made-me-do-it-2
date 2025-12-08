/*
  # Skapa boost-tabeller

  1. Nya tabeller
    - `feeds` - Definiera olika flöden där produkter kan boostas
      - `id` (uuid, primary key)
      - `title` (text) - Namn på flödet (t.ex. "På spisen nu", "Bråttomkäk")
      - `description` (text) - Beskrivning av flödet
      - `requires_membership` (text) - Vilket medlemskapsnivå som krävs
      - `allowed_types` (text[]) - Vilka produkttyper som tillåts
      - `extra_rules` (jsonb) - Extra regler för flödet
      - `is_active` (boolean) - Om flödet är aktivt
      - `sort_order` (integer) - Sorteringsordning
      - `created_at` (timestamptz)

    - `boost_reservations` - Bokningar av boost-platser
      - `id` (uuid, primary key)
      - `feed_id` (uuid) - Referens till feeds
      - `product_id` (uuid, nullable) - Referens till produkten (null för kök-boost)
      - `chef_id` (uuid) - Referens till kocken
      - `slot_tier` (text) - Platsnivå (top2, slot3plus)
      - `period_type` (text) - Periodtyp (weekday_1day, weekend_1day, etc)
      - `start_date` (date) - Startdatum
      - `end_date` (date) - Slutdatum
      - `status` (text) - Status (reserved, active, expired)
      - `created_at` (timestamptz)

    - `boost_orders` - Betalningar för boost
      - `id` (uuid, primary key)
      - `reservation_id` (uuid) - Referens till boost_reservations
      - `chef_id` (uuid) - Referens till kocken
      - `amount` (numeric) - Belopp
      - `payment_status` (text) - Betalningsstatus
      - `created_at` (timestamptz)

  2. Seed-data
    - Lägg till grundläggande flöden

  3. Säkerhet
    - RLS aktiverad på alla tabeller
    - Policies för läsning och skrivning
*/

-- Skapa feeds-tabell
CREATE TABLE IF NOT EXISTS feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  requires_membership text DEFAULT 'free',
  allowed_types text[] DEFAULT ARRAY[]::text[],
  extra_rules jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Skapa boost_reservations-tabell
CREATE TABLE IF NOT EXISTS boost_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid REFERENCES feeds(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  slot_tier text NOT NULL CHECK (slot_tier IN ('top2', 'slot3plus')),
  period_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'reserved' CHECK (status IN ('reserved', 'active', 'expired', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Skapa boost_orders-tabell
CREATE TABLE IF NOT EXISTS boost_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES boost_reservations(id) ON DELETE CASCADE NOT NULL,
  chef_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Seed grundläggande flöden
INSERT INTO feeds (title, description, requires_membership, allowed_types, extra_rules, sort_order, is_active) VALUES
  ('På spisen nu', 'Live-tillagning som pågår just nu', 'free', ARRAY['dish']::text[], '{"max_age_days": null}'::jsonb, 1, true),
  ('Bråttomkäk', 'Snabb leverans inom kort tid', 'free', ARRAY['dish', 'meal_box']::text[], '{"max_delivery_minutes": 60}'::jsonb, 2, true),
  ('Kylskåpsmeny', 'Veckans matlådor', 'free', ARRAY['meal_box']::text[], '{}'::jsonb, 3, true),
  ('Schyssta deals', 'Rabatterade erbjudanden', 'free', ARRAY['dish', 'meal_box']::text[], '{"requires_discount": true}'::jsonb, 4, true),
  ('Smaketiketter', 'Produkter med specifika smaketiketter', 'silver', ARRAY['dish', 'meal_box']::text[], '{"requires_taste_tag": true}'::jsonb, 5, true),
  ('Nytt på menyn', 'Nyligen tillagda rätter', 'free', ARRAY['dish']::text[], '{"max_age_days": 30}'::jsonb, 6, true),
  ('Populärt käk', 'Högst rankade rätter', 'free', ARRAY['dish', 'meal_box']::text[], '{"min_rating": 4.0}'::jsonb, 7, true),
  ('Mitt kök', 'Boosta hela ditt kök', 'silver', ARRAY[]::text[], '{}'::jsonb, 8, true)
ON CONFLICT DO NOTHING;

-- Aktivera RLS
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE boost_orders ENABLE ROW LEVEL SECURITY;

-- Policies för feeds (publikt läsbart)
CREATE POLICY "Anyone can view active feeds"
  ON feeds FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage feeds"
  ON feeds FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies för boost_reservations
CREATE POLICY "Chefs can view own reservations"
  ON boost_reservations FOR SELECT
  TO authenticated
  USING (chef_id = auth.uid());

CREATE POLICY "Chefs can create reservations"
  ON boost_reservations FOR INSERT
  TO authenticated
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Chefs can update own reservations"
  ON boost_reservations FOR UPDATE
  TO authenticated
  USING (chef_id = auth.uid())
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Admins can view all reservations"
  ON boost_reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies för boost_orders
CREATE POLICY "Chefs can view own orders"
  ON boost_orders FOR SELECT
  TO authenticated
  USING (chef_id = auth.uid());

CREATE POLICY "Chefs can create orders"
  ON boost_orders FOR INSERT
  TO authenticated
  WITH CHECK (chef_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON boost_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );