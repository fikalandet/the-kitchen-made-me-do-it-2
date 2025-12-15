/*
  # Lägg till header-styling för FAQ kategorier

  1. Ändringar
    - Lägger till category_description för valfri beskrivning per kategori
    - Lägger till header-styling fält för "vald kategori"-visning
      - header_background_color
      - header_title_font
      - header_title_weight
      - header_title_size
      - header_title_color
      - header_title_align

  2. Säkerhet
    - Inga ändringar i RLS policies
*/

-- Lägg till header-styling för kategorier
ALTER TABLE faq_categories
  ADD COLUMN IF NOT EXISTS category_description text,
  ADD COLUMN IF NOT EXISTS header_background_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS header_title_font text DEFAULT 'lobster',
  ADD COLUMN IF NOT EXISTS header_title_weight text DEFAULT 'bold',
  ADD COLUMN IF NOT EXISTS header_title_size text DEFAULT 'xl',
  ADD COLUMN IF NOT EXISTS header_title_color text DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS header_title_align text DEFAULT 'center';
