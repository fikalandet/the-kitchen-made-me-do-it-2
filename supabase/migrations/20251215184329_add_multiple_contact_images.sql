/*
  # Lägg till stöd för flera bilder på kontaktsidan

  1. Ändringar
    - Lägger till image_url_2 och image_url_3 i `contact_us_page`
    - Möjliggör 1-3 bilder i bildsektion
    - Bilder visas vertikalt på desktop, endast första på mobil

  2. Säkerhet
    - Inga ändringar i RLS policies
*/

-- Lägg till stöd för fler bilder
ALTER TABLE contact_us_page 
  ADD COLUMN IF NOT EXISTS image_url_2 text,
  ADD COLUMN IF NOT EXISTS image_url_3 text;
