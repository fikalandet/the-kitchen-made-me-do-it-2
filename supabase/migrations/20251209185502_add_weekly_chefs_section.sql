/*
  # Add Weekly Chefs Section (Veckans kockar)

  1. New Section
    - Adds 'veckans-kockar' section to site_sections table
    - Configuration includes:
      - Background color for entire section
      - Heading settings (text, color, font, style, alignment)
      - Rotating subtitle texts with placement and color options
      - Featured chefs with IDs and Kitchen comments
      - Cards per row setting

  2. Section Settings
    - backgroundColor: Color for section background
    - heading: Section title text
    - headingFont: Font family (lobster/sans/serif)
    - headingBold: Bold style toggle
    - headingAlignment: left/center
    - headingColor: Title text color
    - subtitleTexts: Array of rotating texts
    - subtitleRotationInterval: Rotation time in ms
    - subtitlePlacement: inline/below
    - subtitleColor: Subtitle text color
    - featuredChefs: Array of { chefId, comment } objects
    - cardsPerRow: Number of chef cards per row
*/

-- Insert Veckans kockar section if it doesn't exist
INSERT INTO site_sections (name, slug, visible, order_index, settings)
VALUES (
  'Veckans kockar',
  'veckans-kockar',
  true,
  7,
  '{
    "backgroundColor": "#ffffff",
    "heading": "Veckans kockar",
    "headingFont": "lobster",
    "headingBold": false,
    "headingAlignment": "left",
    "headingColor": "#374151",
    "subtitleTexts": ["Hetare än chili, och har fler följare än din grannes surdegsblogg"],
    "subtitleRotationInterval": 10000,
    "subtitlePlacement": "inline",
    "subtitleColor": "#374151",
    "featuredChefs": [],
    "cardsPerRow": 3
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
