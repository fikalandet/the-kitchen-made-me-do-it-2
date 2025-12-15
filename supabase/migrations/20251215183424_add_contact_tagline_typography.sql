/*
  # Lägg till separata typografi-fält för textrader (tagline)

  1. Ändringar
    - Lägger till tagline-specifika typografi-fält i `contact_us_page`
    - `tagline_font` - Typsnitt för textrader
    - `tagline_weight` - Fetstil för textrader
    - `tagline_size` - Storlek för textrader
    - `tagline_color` - Färg för textrader
    - `tagline_align` - Placering för textrader

  2. Säkerhet
    - Inga ändringar i RLS policies

  3. Viktigt
    - Textrader får nu egen typografi, separat från rubrik
    - Standardvärden matchar nuvarande beteende (Poppins, normal, lg)
*/

-- Lägg till tagline typografi-fält
ALTER TABLE contact_us_page 
  ADD COLUMN IF NOT EXISTS tagline_font text NOT NULL DEFAULT 'poppins',
  ADD COLUMN IF NOT EXISTS tagline_weight text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS tagline_size text NOT NULL DEFAULT 'lg',
  ADD COLUMN IF NOT EXISTS tagline_color text NOT NULL DEFAULT '#374151',
  ADD COLUMN IF NOT EXISTS tagline_align text NOT NULL DEFAULT 'center';
