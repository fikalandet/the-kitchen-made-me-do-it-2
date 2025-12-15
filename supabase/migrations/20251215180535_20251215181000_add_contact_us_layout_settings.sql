/*
  # Lägg till layout- och formulärinställningar för Kontakta oss

  1. Nya fält i contact_us_page:
    - `image_placement` (text) - Bildplacering: 'left' eller 'right'
    - `form_background_color` (text) - Bakgrundsfärg för kontaktformuläret
    - `form_border_radius` (text) - Rundade hörn: 'none', 'small', 'medium', 'large'
    - `form_padding` (text) - Inre padding: 'small', 'medium', 'large'
*/

-- Lägg till nya kolumner i contact_us_page
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_us_page' AND column_name = 'image_placement'
  ) THEN
    ALTER TABLE contact_us_page ADD COLUMN image_placement text NOT NULL DEFAULT 'left';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_us_page' AND column_name = 'form_background_color'
  ) THEN
    ALTER TABLE contact_us_page ADD COLUMN form_background_color text NOT NULL DEFAULT '#ffffff';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_us_page' AND column_name = 'form_border_radius'
  ) THEN
    ALTER TABLE contact_us_page ADD COLUMN form_border_radius text NOT NULL DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_us_page' AND column_name = 'form_padding'
  ) THEN
    ALTER TABLE contact_us_page ADD COLUMN form_padding text NOT NULL DEFAULT 'medium';
  END IF;
END $$;
