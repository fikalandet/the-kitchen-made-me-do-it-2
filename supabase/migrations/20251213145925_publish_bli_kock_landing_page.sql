/*
  # Publicera "Bli en kock"-landningssidan

  1. Uppdateringar
    - Sätt `is_published = true` för landningssidan med slug "bli-kock"
    - Detta gör sidan tillgänglig för alla besökare via /bli-kock

  2. Bakgrund
    - Sidan skapades som opublicerad (is_published = false)
    - Frontend visar endast publicerade sidor för allmänheten
    - Header-länken "Bli kock" går till /bli-kock men sidan visas inte
*/

-- Publicera "Bli en kock"-landningssidan
UPDATE landing_pages
SET is_published = true
WHERE slug = 'bli-kock';
