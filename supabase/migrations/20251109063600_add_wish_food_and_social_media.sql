/*
  # Add wish food feature and social media links

  ## Changes
  
  1. **profiles table**
    - Add `wish_food_enabled` boolean field to control if customers can wish for food
    - Add social media fields for Instagram, Facebook, TikTok, YouTube, Twitter (X), LinkedIn
  
  2. **Security**
    - All fields accessible through existing RLS policies
    - No new tables or policies needed
*/

-- Add wish food enabled field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wish_food_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wish_food_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Add social media fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN instagram_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'facebook_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN facebook_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tiktok_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tiktok_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN youtube_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN twitter_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin_url text;
  END IF;
END $$;