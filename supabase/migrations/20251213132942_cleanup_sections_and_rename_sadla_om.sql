/*
  # Cleanup and rename sections

  1. Changes
    - Remove "Hälsokäk" section (now part of Editorial Categories)
    - Rename "Bli en kitchen-kock" to "Sadla om"
    - Update slug from 'bli-kitchen-kock' to 'sadla-om'

  2. Notes
    - "Hälsokäk" content remains as editorial category
    - All settings for "Bli en kitchen-kock" are preserved
*/

-- Remove Hälsokäk as standalone section
DELETE FROM site_sections WHERE slug = 'halsokak';

-- Rename and update slug for "Bli en kitchen-kock" -> "Sadla om"
UPDATE site_sections
SET
  name = 'Sadla om',
  slug = 'sadla-om'
WHERE slug = 'bli-kitchen-kock';
