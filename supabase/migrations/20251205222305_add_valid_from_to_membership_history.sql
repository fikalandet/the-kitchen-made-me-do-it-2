/*
  # Lägg till valid_from för tillfälliga medlemskapsändringar

  1. Ändring
    - Lägg till kolumn `valid_from` (date, nullable) i chef_membership_history
    - Detta möjliggör att ange både från- och till-datum för tillfälliga medlemskap
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chef_membership_history' AND column_name = 'valid_from'
  ) THEN
    ALTER TABLE chef_membership_history ADD COLUMN valid_from date;
  END IF;
END $$;
