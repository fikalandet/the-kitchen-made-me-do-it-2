/*
  # Fix Gift Cards Schema for V4

  1. First update existing data to match new template values
  2. Then add new constraint
  3. Add new columns to giftcard_redemptions
*/

ALTER TABLE giftcards DROP CONSTRAINT IF EXISTS giftcards_template_check;

UPDATE giftcards SET template = 'Green' WHERE template = 'Classic Green';
UPDATE giftcards SET template = 'Beige' WHERE template = 'Soft Beige';

ALTER TABLE giftcards ADD CONSTRAINT giftcards_template_check CHECK (template IN ('Green', 'Beige'));

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcards' AND column_name = 'total_available') THEN
    ALTER TABLE giftcards DROP COLUMN total_available;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcards' AND column_name = 'sold_count') THEN
    ALTER TABLE giftcards DROP COLUMN sold_count;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcards' AND column_name = 'share_url') THEN
    ALTER TABLE giftcards DROP COLUMN share_url;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'buyer_id') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN buyer_id uuid REFERENCES profiles(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'amount') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN amount numeric NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'heading') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN heading text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'template') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN template text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'payment_split_chef') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN payment_split_chef numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'giftcard_redemptions' AND column_name = 'payment_split_platform') THEN
    ALTER TABLE giftcard_redemptions ADD COLUMN payment_split_platform numeric;
  END IF;
END $$;

DROP POLICY IF EXISTS "Chefs can view own gift cards" ON giftcards;
DROP POLICY IF EXISTS "Chefs can create own gift cards" ON giftcards;
DROP POLICY IF EXISTS "Chefs can update own gift cards" ON giftcards;
DROP POLICY IF EXISTS "Chefs can delete own gift cards" ON giftcards;
DROP POLICY IF EXISTS "Public can view active gift cards" ON giftcards;
DROP POLICY IF EXISTS "Gold chefs can create gift cards" ON giftcards;

CREATE POLICY "Chefs can view all gift cards"
  ON giftcards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gold chefs can create gift cards"
  ON giftcards FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = chef_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.membership_level = 'gold'
    )
  );

CREATE POLICY "Chefs can update own gift cards"
  ON giftcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Public can view active gift cards"
  ON giftcards FOR SELECT
  TO anon
  USING (is_active = true);
