/*
  # Utöka varningssystem för automatiska varningar

  1. Ändringar
    - Lägg till `source` kolumn (manual, rating, report, chat)
    - Lägg till `is_new` kolumn (boolean, default true)
    - Lägg till `related_id` kolumn (uuid, nullable)
    - Lägg till `short_summary` kolumn (text, nullable)

  2. Index
    - Index på `is_new` för snabba frågor på nya varningar
    - Index på `source` för filtrering per typ
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chef_warnings' AND column_name = 'source'
  ) THEN
    ALTER TABLE chef_warnings ADD COLUMN source text NOT NULL DEFAULT 'manual' 
      CHECK (source IN ('manual', 'rating', 'report', 'chat', 'feedback'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chef_warnings' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE chef_warnings ADD COLUMN is_new boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chef_warnings' AND column_name = 'related_id'
  ) THEN
    ALTER TABLE chef_warnings ADD COLUMN related_id uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chef_warnings' AND column_name = 'short_summary'
  ) THEN
    ALTER TABLE chef_warnings ADD COLUMN short_summary text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_chef_warnings_is_new ON chef_warnings(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_chef_warnings_source ON chef_warnings(source);
