/*
  # Add typography fields to editorial_categories

  1. Changes
    - Add heading typography fields (font, bold, italic, size, alignment, color)
    - Add description typography fields (font, bold, italic, size, alignment, color)
    - Add CTA button typography fields (text_color, bg_color, font, bold, placement)

  These fields allow per-category customization of text styling without needing
  separate admin sections.
*/

-- Add heading typography fields
ALTER TABLE editorial_categories
ADD COLUMN IF NOT EXISTS title_font text DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS title_bold boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS title_italic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS title_size integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS title_alignment text DEFAULT 'left',
ADD COLUMN IF NOT EXISTS title_color text DEFAULT '#1f2937';

-- Add description typography fields
ALTER TABLE editorial_categories
ADD COLUMN IF NOT EXISTS description_font text DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS description_bold boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS description_italic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS description_size integer DEFAULT 16,
ADD COLUMN IF NOT EXISTS description_alignment text DEFAULT 'left',
ADD COLUMN IF NOT EXISTS description_color text DEFAULT '#4b5563';

-- Add CTA button typography fields
ALTER TABLE editorial_categories
ADD COLUMN IF NOT EXISTS cta_bg_color text DEFAULT '#a1c798',
ADD COLUMN IF NOT EXISTS cta_text_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS cta_font text DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS cta_bold boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS cta_placement text DEFAULT 'left';
