/*
  # Lägg till styling för frågor och svar per kategori

  1. Ändringar
    - Lägger till question_styles och answer_styles i faq_categories
    - Dessa styr hur frågor och svar renderas i just den kategorin

  2. Säkerhet
    - Inga ändringar i RLS policies
*/

-- Lägg till styling för frågor och svar per kategori
ALTER TABLE faq_categories
  ADD COLUMN IF NOT EXISTS question_background_color text DEFAULT '#f9fafb',
  ADD COLUMN IF NOT EXISTS answer_background_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS question_font text DEFAULT 'poppins',
  ADD COLUMN IF NOT EXISTS question_weight text DEFAULT 'semibold',
  ADD COLUMN IF NOT EXISTS question_size text DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS question_color text DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS answer_font text DEFAULT 'poppins',
  ADD COLUMN IF NOT EXISTS answer_weight text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS answer_size text DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS answer_color text DEFAULT '#374151';
