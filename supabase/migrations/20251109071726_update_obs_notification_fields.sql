/*
  # Update OBS notification fields

  ## Changes
  
  1. **profiles table**
    - Add `obs_notification_title` text field for notification title (bold)
    - Add `obs_notification_emoji_before` text field for emoji before text
    - Add `obs_notification_emoji_after` text field for emoji after text
    - Add `obs_notification_bg_color` text field for background color choice
    - Keep existing `obs_notification_text` for the main text
  
  2. **Security**
    - All fields accessible through existing RLS policies
*/

-- Add new OBS notification fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'obs_notification_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN obs_notification_title text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'obs_notification_emoji_before'
  ) THEN
    ALTER TABLE profiles ADD COLUMN obs_notification_emoji_before text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'obs_notification_emoji_after'
  ) THEN
    ALTER TABLE profiles ADD COLUMN obs_notification_emoji_after text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'obs_notification_bg_color'
  ) THEN
    ALTER TABLE profiles ADD COLUMN obs_notification_bg_color text DEFAULT 'light-yellow';
  END IF;
END $$;