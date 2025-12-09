/*
  # Add Tjuvkik i köket Section Settings

  1. Changes
    - Updates Tjuvkik i köket section with complete settings structure
    - Matches the same settings structure as Populärt käk, Bråttomkäk, etc.

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
  'heading', 'Tjuvkik i köket',
  'headingFont', 'lobster',
  'headingBold', false,
  'headingAlignment', 'left',
  'headingColor', '#374151',
  'subtitleTexts', jsonb_build_array('Se vad som lagas live just nu'),
  'subtitleRotationInterval', 10000,
  'subtitlePlacement', 'inline',
  'subtitleColor', '#374151',
  'cardsPerRow', 4
)
WHERE slug = 'tjuvkik-i-koket';
