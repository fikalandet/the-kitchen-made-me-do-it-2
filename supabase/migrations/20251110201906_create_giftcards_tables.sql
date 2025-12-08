/*
  # Create Gift Cards System

  1. New Tables
    - `giftcards`
      - `id` (uuid, primary key)
      - `chef_id` (uuid, FK to profiles)
      - `name` (text, gift card name)
      - `amount` (numeric, monetary value)
      - `validity_months` (int, validity period)
      - `total_available` (int, total quantity)
      - `sold_count` (int, number sold)
      - `template` (text, design template)
      - `is_active` (boolean, active status)
      - `created_at` (timestamptz)
      - `expires_at` (date)
      - `logo_url` (text)
      - `preview_image_url` (text)
      - `share_url` (text)
    
    - `giftcard_redemptions`
      - `id` (uuid, primary key)
      - `giftcard_id` (uuid, FK to giftcards)
      - `code` (text, unique code)
      - `qr_code_url` (text)
      - `sent_to` (text, recipient email or phone)
      - `delivery_method` (text, email/sms)
      - `greeting_message` (text, custom message)
      - `redeemed` (boolean, redemption status)
      - `redeemed_at` (timestamptz)
      - `redeemed_by` (uuid, chef who redeemed)
      - `link_url` (text, gift card page URL)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Policies for chefs to manage their own gift cards
    - Public access to view valid unredeemed gift cards
*/

CREATE TABLE IF NOT EXISTS giftcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  validity_months int NOT NULL DEFAULT 12 CHECK (validity_months > 0),
  total_available int NOT NULL DEFAULT 1 CHECK (total_available > 0),
  sold_count int NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  template text NOT NULL CHECK (template IN ('Classic Green', 'Soft Beige')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at date,
  logo_url text,
  preview_image_url text,
  share_url text
);

CREATE TABLE IF NOT EXISTS giftcard_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giftcard_id uuid NOT NULL REFERENCES giftcards(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  qr_code_url text,
  sent_to text NOT NULL,
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'sms', 'both')),
  greeting_message text,
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by uuid REFERENCES profiles(id),
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE giftcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE giftcard_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chefs can view own gift cards"
  ON giftcards FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Chefs can create own gift cards"
  ON giftcards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can update own gift cards"
  ON giftcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = chef_id)
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can delete own gift cards"
  ON giftcards FOR DELETE
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Public can view active gift cards"
  ON giftcards FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Chefs can view own redemptions"
  ON giftcard_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giftcards
      WHERE giftcards.id = giftcard_redemptions.giftcard_id
      AND giftcards.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can create redemptions for own cards"
  ON giftcard_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giftcards
      WHERE giftcards.id = giftcard_redemptions.giftcard_id
      AND giftcards.chef_id = auth.uid()
    )
  );

CREATE POLICY "Chefs can update redemptions for own cards"
  ON giftcard_redemptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giftcards
      WHERE giftcards.id = giftcard_redemptions.giftcard_id
      AND giftcards.chef_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giftcards
      WHERE giftcards.id = giftcard_redemptions.giftcard_id
      AND giftcards.chef_id = auth.uid()
    )
  );

CREATE POLICY "Public can view unredeemed gift card codes"
  ON giftcard_redemptions FOR SELECT
  TO anon, authenticated
  USING (redeemed = false);

CREATE INDEX IF NOT EXISTS idx_giftcards_chef_id ON giftcards(chef_id);
CREATE INDEX IF NOT EXISTS idx_giftcards_is_active ON giftcards(is_active);
CREATE INDEX IF NOT EXISTS idx_giftcard_redemptions_code ON giftcard_redemptions(code);
CREATE INDEX IF NOT EXISTS idx_giftcard_redemptions_redeemed ON giftcard_redemptions(redeemed);
