/*
  # Lägg till kvitto-flagga för livsmedelsregistrering

  1. Ändringar
    - Lägg till `has_food_registration_receipt` (boolean) i profiles-tabellen
    - Detta är ett krav för att kocken ska kunna gå live
    - Lägg till `document_type` i chef_documents för kategorisering av dokument

  2. Säkerhet
    - Inga RLS-ändringar behövs, befintliga policies gäller
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_food_registration_receipt'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_food_registration_receipt boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chef_documents' AND column_name = 'document_type'
  ) THEN
    ALTER TABLE chef_documents ADD COLUMN document_type text DEFAULT 'formal';
  END IF;
END $$;
