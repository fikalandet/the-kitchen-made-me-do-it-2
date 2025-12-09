/*
  # Add Fridge Menu Section (Kylskåpsmeny)

  1. New Section
    - Adds 'kylskapsmeny' section to site_sections table
    - Configuration includes:
      - Background color for entire section
      - Heading settings (text, color, font, style, alignment)
      - Rotating subtitle texts with placement and color options
      - Cards per row setting
      - Layout type (horizontal/grid)

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
    - cardsPerRow: Number of product cards per row
    - layout: horizontal/grid

  3. Product Types
    - This section displays: meal_box, cooking_kit, subscription
*/

-- Insert Kylskåpsmeny section if it doesn't exist
INSERT INTO site_sections (name, slug, visible, order_index, settings)
VALUES (
  'Kylskåpsmeny',
  'kylskapsmeny',
  true,
  6,
  '{
    "backgroundColor": "#ffffff",
    "heading": "Kylskåpsmeny",
    "headingFont": "lobster",
    "headingBold": false,
    "headingAlignment": "left",
    "headingColor": "#374151",
    "subtitleTexts": ["Matlådekassar, laga-själv-kit och prenumerationer"],
    "subtitleRotationInterval": 10000,
    "subtitlePlacement": "inline",
    "subtitleColor": "#374151",
    "cardsPerRow": 4,
    "layout": "horizontal"
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
