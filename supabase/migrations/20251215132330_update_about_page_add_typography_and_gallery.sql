/*
  # Uppdatera Om oss-sidan med typografi och bildgalleri

  1. Uppdateringar till about_page_rows
    - Lägg till typografi-fält för rubrik
      - `title_font` (text, default 'poppins')
      - `title_weight` (text, default 'bold')
      - `title_size` (text, default 'xl')
      - `title_color` (text, default '#000000')
      - `title_align` (text, default 'left')
    - Lägg till typografi-fält för text
      - `text_font` (text, default 'poppins')
      - `text_size` (text, default 'md')
      - `text_color` (text, default '#000000')
      - `text_align` (text, default 'left')

  2. Uppdateringar till about_page
    - Ersätt hero_image med bildgalleri
      - `hero_gallery_images` (jsonb, array med bild-URLs)
      - `hero_gallery_border_color` (text, default '#a1c798')
      - `hero_gallery_style` (text, default 'overlap')
      - `hero_gallery_max_images` (int, default 3)
    - Behåll hero_image för bakåtkompatibilitet men gör den optional

  3. Säkerhet
    - Inga ändringar i RLS policies behövs
*/

-- Lägg till typografi-fält i about_page_rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'title_font'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN title_font text DEFAULT 'poppins';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'title_weight'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN title_weight text DEFAULT 'bold';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'title_size'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN title_size text DEFAULT 'xl';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'title_color'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN title_color text DEFAULT '#000000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'title_align'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN title_align text DEFAULT 'left';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'text_font'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN text_font text DEFAULT 'poppins';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'text_size'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN text_size text DEFAULT 'md';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'text_color'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN text_color text DEFAULT '#000000';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page_rows' AND column_name = 'text_align'
  ) THEN
    ALTER TABLE about_page_rows ADD COLUMN text_align text DEFAULT 'left';
  END IF;
END $$;

-- Lägg till bildgalleri-fält i about_page
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page' AND column_name = 'hero_gallery_images'
  ) THEN
    ALTER TABLE about_page ADD COLUMN hero_gallery_images jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page' AND column_name = 'hero_gallery_border_color'
  ) THEN
    ALTER TABLE about_page ADD COLUMN hero_gallery_border_color text DEFAULT '#a1c798';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page' AND column_name = 'hero_gallery_style'
  ) THEN
    ALTER TABLE about_page ADD COLUMN hero_gallery_style text DEFAULT 'overlap';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page' AND column_name = 'hero_gallery_max_images'
  ) THEN
    ALTER TABLE about_page ADD COLUMN hero_gallery_max_images int DEFAULT 3;
  END IF;
END $$;
