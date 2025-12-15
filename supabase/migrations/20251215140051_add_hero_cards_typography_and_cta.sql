/*
  # Lägg till typografi och CTA-kontroller för hero-kort

  1. Ändringar
    - Lägg till typografi-fält för rubrik (font, weight, size, color, align)
    - Lägg till typografi-fält för text (font, size, color, align)
    - Lägg till CTA-fält (text, link, style)
    
  2. Noteringar
    - Detta gäller hero-korten i "Våra värderingar" och "Upptäck"-sektionerna
    - Ändringarna görs i både about_page_values_cards och about_page_discover_cards
*/

-- Lägg till typografi för rubrik i values_cards
ALTER TABLE about_page_values_cards
ADD COLUMN IF NOT EXISTS heading_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS heading_weight text DEFAULT 'bold',
ADD COLUMN IF NOT EXISTS heading_size text DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS heading_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS heading_align text DEFAULT 'center';

-- Lägg till typografi för text i values_cards
ALTER TABLE about_page_values_cards
ADD COLUMN IF NOT EXISTS text_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS text_size text DEFAULT 'base',
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS text_align text DEFAULT 'center';

-- Lägg till CTA i values_cards
ALTER TABLE about_page_values_cards
ADD COLUMN IF NOT EXISTS cta_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_link text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_style text DEFAULT 'primary';

-- Samma för discover_cards
ALTER TABLE about_page_discover_cards
ADD COLUMN IF NOT EXISTS heading_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS heading_weight text DEFAULT 'bold',
ADD COLUMN IF NOT EXISTS heading_size text DEFAULT 'lg',
ADD COLUMN IF NOT EXISTS heading_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS heading_align text DEFAULT 'center';

ALTER TABLE about_page_discover_cards
ADD COLUMN IF NOT EXISTS text_font text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS text_size text DEFAULT 'base',
ADD COLUMN IF NOT EXISTS text_color text DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS text_align text DEFAULT 'center';

ALTER TABLE about_page_discover_cards
ADD COLUMN IF NOT EXISTS cta_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_link text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_style text DEFAULT 'primary';