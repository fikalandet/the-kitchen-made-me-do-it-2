/*
  # Lägg till typografi-fält för tagline och ingress i about_page

  1. Ändringar
    - Lägger till typografi-fält för tagline (font, weight, size, color, align)
    - Lägger till typografi-fält för ingress (font, weight, size, color, align)
  
  2. Anledning
    - Admin sparar typografi-inställningar som inte används i frontend
    - Synkroniserar admin och frontend enligt GLOBAL_EDITOR_AND_LAYOUT_RULES.md
    - Säkerställer att alla textfält har konsekvent typografi-kontroll
*/

-- Lägg till tagline typografi-fält
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS tagline_font text DEFAULT 'poppins';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS tagline_weight text DEFAULT 'normal';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS tagline_size text DEFAULT 'xl';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS tagline_color text DEFAULT '#000000';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS tagline_align text DEFAULT 'center';

-- Lägg till ingress typografi-fält
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS ingress_font text DEFAULT 'poppins';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS ingress_weight text DEFAULT 'normal';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS ingress_size text DEFAULT 'lg';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS ingress_color text DEFAULT '#374151';
ALTER TABLE about_page ADD COLUMN IF NOT EXISTS ingress_align text DEFAULT 'center';
