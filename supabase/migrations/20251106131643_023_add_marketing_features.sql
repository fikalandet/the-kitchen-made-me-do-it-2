/*
  # Add Marketing and Promotional Features

  ## Overview
  This migration adds comprehensive marketing and promotional features to help chefs promote their products effectively.

  ## 1. New Tables
    - `product_marketing_features` - Tracks which marketing features are active for products
    - `marketing_feature_definitions` - Defines available marketing features and their properties
    - `product_boost_history` - Historical record of product boosts for analytics

  ## 2. Changes to Existing Tables
    - Add marketing-related columns to `products` table:
      - `is_pa_spisen_nu` - Product is marked as "On the stove now" (ready immediately)
      - `is_brattomkak` - Product is marked as "Rush food" (fast delivery)
      - `brattomkak_delivery_minutes` - Delivery time in minutes for rush food
      - `special_tags` - Array of special promotional tags
      - `promoted_until` - Timestamp for promotional period

  ## 3. Security
    - Enable RLS on all new tables
    - Add policies for sellers to manage their product marketing features
    - Add policies for public viewing of marketing features

  ## 4. Important Notes
    - Marketing features respect membership levels (free, silver, gold)
    - Boosting requires silver or gold membership
    - Some features may have time limits or capacity restrictions
*/

-- Add marketing columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_pa_spisen_nu'
  ) THEN
    ALTER TABLE products ADD COLUMN is_pa_spisen_nu boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_brattomkak'
  ) THEN
    ALTER TABLE products ADD COLUMN is_brattomkak boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'brattomkak_delivery_minutes'
  ) THEN
    ALTER TABLE products ADD COLUMN brattomkak_delivery_minutes integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'special_tags'
  ) THEN
    ALTER TABLE products ADD COLUMN special_tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'promoted_until'
  ) THEN
    ALTER TABLE products ADD COLUMN promoted_until timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'priority_score'
  ) THEN
    ALTER TABLE products ADD COLUMN priority_score integer DEFAULT 0;
  END IF;
END $$;

-- Marketing feature definitions
CREATE TABLE IF NOT EXISTS marketing_feature_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_code text UNIQUE NOT NULL,
  feature_name text NOT NULL,
  description text,
  icon_name text,
  requires_membership_level membership_level,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Product marketing features junction table
CREATE TABLE IF NOT EXISTS product_marketing_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  feature_code text NOT NULL,
  is_active boolean DEFAULT true,
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, feature_code)
);

-- Product boost history for analytics
CREATE TABLE IF NOT EXISTS product_boost_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boost_type text NOT NULL,
  boost_duration_hours integer,
  cost_in_points integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  impressions_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default marketing feature definitions
INSERT INTO marketing_feature_definitions (feature_code, feature_name, description, icon_name, requires_membership_level, display_order) VALUES
  ('boost', 'Boosta produkten', 'Öka synligheten för din produkt i sökresultaten och på startsidan', 'Rocket', 'silver', 1),
  ('pa_spisen_nu', 'På spisen nu', 'Markera att produkten är färdig nu eller inom mycket kort tid', 'Flame', null, 2),
  ('brattomkak', 'Bråttomkäk', 'Snabb leverans inom 30-60 minuter för hungriga kunder', 'Clock', null, 3),
  ('i_frysen', 'I frysen', 'Produkten är fryst och hållbar längre', 'Snowflake', null, 4),
  ('schyssta_deals', 'Schyssta deals', 'Rabatterade priser eller specialerbjudanden', 'Tag', null, 5),
  ('testkaka', 'Testkäk & Tyck till', 'Låt kunder testa och ge feedback på nya rätter', 'TestTube', null, 6),
  ('tavlingar', 'Tävlingar', 'Skapa tävlingar och engagera kunder (endast Gold-kockar)', 'Trophy', 'gold', 7),
  ('evenemang', 'Evenemang', 'Koppla produkten till specifika evenemang eller platser', 'MapPin', null, 8)
ON CONFLICT (feature_code) DO NOTHING;

-- Enable RLS
ALTER TABLE marketing_feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_marketing_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_boost_history ENABLE ROW LEVEL SECURITY;

-- Marketing feature definitions policies (public read)
CREATE POLICY "Anyone can view marketing feature definitions"
  ON marketing_feature_definitions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Product marketing features policies
CREATE POLICY "Anyone can view active marketing features"
  ON product_marketing_features FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Sellers can manage their product marketing features"
  ON product_marketing_features FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_marketing_features.product_id 
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_marketing_features.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- Product boost history policies
CREATE POLICY "Sellers can view their boost history"
  ON product_boost_history FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "System can insert boost history"
  ON product_boost_history FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- Create index for efficient querying of marketing features
CREATE INDEX IF NOT EXISTS idx_products_is_pa_spisen_nu ON products(is_pa_spisen_nu) WHERE is_pa_spisen_nu = true;
CREATE INDEX IF NOT EXISTS idx_products_is_brattomkak ON products(is_brattomkak) WHERE is_brattomkak = true;
CREATE INDEX IF NOT EXISTS idx_products_is_boosted ON products(is_boosted) WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_products_priority_score ON products(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_product_marketing_features_product_id ON product_marketing_features(product_id);
CREATE INDEX IF NOT EXISTS idx_product_marketing_features_feature_code ON product_marketing_features(feature_code);

-- Create function to calculate product priority score
CREATE OR REPLACE FUNCTION calculate_product_priority_score(product_id uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
BEGIN
  -- Base score from product table
  SELECT 
    CASE WHEN is_boosted THEN 100 ELSE 0 END +
    CASE WHEN is_pa_spisen_nu THEN 50 ELSE 0 END +
    CASE WHEN is_brattomkak THEN 40 ELSE 0 END +
    CASE WHEN featured_on_homepage THEN 30 ELSE 0 END
  INTO score
  FROM products
  WHERE id = product_id;
  
  RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update priority score
CREATE OR REPLACE FUNCTION update_product_priority_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.priority_score := calculate_product_priority_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_priority_score ON products;
CREATE TRIGGER trigger_update_product_priority_score
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_priority_score();
