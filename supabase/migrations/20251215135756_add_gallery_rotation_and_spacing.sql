/*
  # Lägg till rotation och spacing för bildgalleri

  1. Ändringar
    - Ändra `hero_gallery_max_images` från max 5 till max 8
    - Lägg till `hero_gallery_spacing` för att kontrollera avstånd mellan bilder
    - Ändra `hero_gallery_images` från enkel array till array med objekt (url, rotation)
    
  2. Noteringar
    - `hero_gallery_images` blir nu JSONB array med format: [{"url": "...", "rotation": 0}, ...]
    - `hero_gallery_spacing` är i pixels (standard: 16)
*/

-- Lägg till spacing-kolumn
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'about_page' AND column_name = 'hero_gallery_spacing'
  ) THEN
    ALTER TABLE about_page ADD COLUMN hero_gallery_spacing integer DEFAULT 16;
  END IF;
END $$;

-- Uppdatera kommentar för att visa ny max
COMMENT ON COLUMN about_page.hero_gallery_max_images IS 'Max antal bilder i galleriet (3-8)';