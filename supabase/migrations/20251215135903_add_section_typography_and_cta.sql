/*
  # Lägg till typografi och CTA-kontroller för sektioner

  1. Ändringar
    - Lägg till typografi-fält för tagline (font, size, color, align)
    - Lägg till typografi-fält för ingress (font, size, color, align)
    - Lägg till CTA-fält (text, link, style)
    - Lägg till title_weight för rubriker
    
  2. Noteringar
    - Detta gäller "Visa sektion"-korten (Våra värderingar, Upptäck, etc.)
*/

-- Lägg till typografi för tagline
ALTER TABLE about_page_sections_settings
ADD COLUMN IF NOT EXISTS tagline_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS tagline_size text DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS tagline_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS tagline_align text DEFAULT 'center';

-- Lägg till typografi för ingress
ALTER TABLE about_page_sections_settings
ADD COLUMN IF NOT EXISTS ingress_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS ingress_size text DEFAULT 'base',
ADD COLUMN IF NOT EXISTS ingress_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS ingress_align text DEFAULT 'center';

-- Lägg till title_weight
ALTER TABLE about_page_sections_settings
ADD COLUMN IF NOT EXISTS title_weight text DEFAULT 'bold';

-- Lägg till CTA-knapp
ALTER TABLE about_page_sections_settings
ADD COLUMN IF NOT EXISTS cta_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_link text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_style text DEFAULT 'primary';