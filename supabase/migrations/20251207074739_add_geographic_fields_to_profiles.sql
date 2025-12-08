/*
  # Add Geographic Fields to Profiles

  1. New Fields
    - `country` (text) - Country name (default: 'Sverige')
    - `region` (text) - Region/Län name (e.g., 'Stockholms län', 'Västra Götalands län')

  2. Purpose
    - Enable geographic distribution tracking for chefs
    - Support filtering and analysis by country and region
    - Allow admin to view geographic spread of chef network

  3. Notes
    - All fields have safe defaults
    - Existing data remains unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text DEFAULT 'Sverige';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'region'
  ) THEN
    ALTER TABLE profiles ADD COLUMN region text DEFAULT '';
  END IF;
END $$;
