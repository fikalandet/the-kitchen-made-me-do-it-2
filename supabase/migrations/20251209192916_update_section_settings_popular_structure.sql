/*
  # Update Section Settings with Popular Structure

  1. Changes
    - Updates Bråttomkäk section with complete settings structure
    - Updates Schyssta deals section with complete settings structure
    - Updates Evenemang section with complete settings structure
    - Updates Tävlingar section with complete settings structure
    - All sections get the same settings structure as Populärt käk
    
  2. Settings Structure
    - backgroundColor: Background color for entire section
    - heading: Section title text
    - headingFont: Font family (lobster/sans/serif)
    - headingBold: Bold style toggle
    - headingAlignment: left/center
    - headingColor: Title text color
    - subtitleTexts: Array of rotating subtitle texts
    - subtitleRotationInterval: Rotation time in milliseconds
    - subtitlePlacement: inline/below
    - subtitleColor: Subtitle text color
    - cardsPerRow: Number of product cards per row
*/

UPDATE site_sections
SET settings = jsonb_build_object(
  'backgroundColor', '#ffffff',
  'heading', 'Bråttomkäk',
  'headingFont', 'lobster',
  'headingBold', false,
  'headingAlignment', 'left',
  'headingColor', '#374151',
  'subtitleTexts', jsonb_build_array('Snabb leverans för hungriga magar'),
  'subtitleRotationInterval', 10000,
  'subtitlePlacement', 'inline',
  'subtitleColor', '#374151',
  'cardsPerRow', 4
)
WHERE slug = 'brattomkak';

UPDATE site_sections
SET settings = jsonb_build_object(
  'backgroundColor', '#ffffff',
  'heading', 'Schyssta deals',
  'headingFont', 'lobster',
  'headingBold', false,
  'headingAlignment', 'left',
  'headingColor', '#374151',
  'subtitleTexts', jsonb_build_array('Spara pengar och smaka bra'),
  'subtitleRotationInterval', 10000,
  'subtitlePlacement', 'inline',
  'subtitleColor', '#374151',
  'cardsPerRow', 4
)
WHERE slug = 'schyssta-deals';

UPDATE site_sections
SET settings = jsonb_build_object(
  'backgroundColor', '#ffffff',
  'heading', 'Evenemang',
  'headingFont', 'lobster',
  'headingBold', false,
  'headingAlignment', 'left',
  'headingColor', '#374151',
  'subtitleTexts', jsonb_build_array('Mat, mingel och nya kunskaper'),
  'subtitleRotationInterval', 10000,
  'subtitlePlacement', 'inline',
  'subtitleColor', '#374151',
  'cardsPerRow', 4
)
WHERE slug = 'evenemang';

UPDATE site_sections
SET settings = jsonb_build_object(
  'backgroundColor', '#ffffff',
  'heading', 'Tävlingar',
  'headingFont', 'lobster',
  'headingBold', false,
  'headingAlignment', 'left',
  'headingColor', '#374151',
  'subtitleTexts', jsonb_build_array('Tävla och vinn fina priser'),
  'subtitleRotationInterval', 10000,
  'subtitlePlacement', 'inline',
  'subtitleColor', '#374151',
  'cardsPerRow', 4
)
WHERE slug = 'tavlingar';
