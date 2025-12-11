/*
  # Add Advanced Features to Editorial Categories

  1. New Fields for editorial_articles
    - `hero_image_size` (text) - Size of hero image: 'medium', 'large', 'full'
    - `hero_image_position` (text) - Image positioning: 'top', 'center', 'bottom'
    - `hero_wave_style` (text) - Wave style for image: 'none', 'wave1', 'wave2', 'wave3'
    - `trivia_layout` (text) - Trivia box layout: 'single', 'double'
    - `trivia_position` (text) - Trivia position: 'below_image', 'sidebar'
    - `trivia_column1` (text) - First column of trivia facts
    - `trivia_column2` (text) - Second column of trivia facts (if double layout)
    
    - `cta_primary_text` (text) - Primary CTA button text (default "Läs artikeln")
    - `cta_primary_bg_color` (text) - Primary button background color
    - `cta_primary_text_color` (text) - Primary button text color
    - `cta_primary_bg_opacity` (integer) - Primary button background opacity (0-100)
    - `cta_primary_font` (text) - Primary button font
    - `cta_primary_placement` (text) - Primary button placement
    
    - `cta_secondary_text` (text) - Secondary CTA button text (default "Till kockens sida")
    - `cta_secondary_bg_color` (text) - Secondary button background color
    - `cta_secondary_text_color` (text) - Secondary button text color
    - `cta_secondary_bg_opacity` (integer) - Secondary button background opacity (0-100)
    - `cta_secondary_font` (text) - Secondary button font
    - `cta_secondary_placement` (text) - Secondary button placement
    - `cta_secondary_chef_id` (uuid) - Link to chef profile

  2. Security
    - No changes to RLS policies needed
*/

-- Add hero image settings
ALTER TABLE editorial_articles
ADD COLUMN IF NOT EXISTS hero_image_size text DEFAULT 'large',
ADD COLUMN IF NOT EXISTS hero_image_position text DEFAULT 'center',
ADD COLUMN IF NOT EXISTS hero_wave_style text DEFAULT 'none';

-- Add trivia box settings
ALTER TABLE editorial_articles
ADD COLUMN IF NOT EXISTS trivia_layout text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS trivia_position text DEFAULT 'below_image',
ADD COLUMN IF NOT EXISTS trivia_column1 text DEFAULT '',
ADD COLUMN IF NOT EXISTS trivia_column2 text DEFAULT '';

-- Add primary CTA button settings
ALTER TABLE editorial_articles
ADD COLUMN IF NOT EXISTS cta_primary_text text DEFAULT 'Läs artikeln',
ADD COLUMN IF NOT EXISTS cta_primary_bg_color text DEFAULT '#a1c798',
ADD COLUMN IF NOT EXISTS cta_primary_text_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS cta_primary_bg_opacity integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS cta_primary_font text DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS cta_primary_placement text DEFAULT 'left';

-- Add secondary CTA button settings
ALTER TABLE editorial_articles
ADD COLUMN IF NOT EXISTS cta_secondary_text text DEFAULT 'Till kockens sida',
ADD COLUMN IF NOT EXISTS cta_secondary_bg_color text DEFAULT '#56c5c5',
ADD COLUMN IF NOT EXISTS cta_secondary_text_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS cta_secondary_bg_opacity integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS cta_secondary_font text DEFAULT 'sans',
ADD COLUMN IF NOT EXISTS cta_secondary_placement text DEFAULT 'left',
ADD COLUMN IF NOT EXISTS cta_secondary_chef_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
