/*
  # Update Weekly Chefs Section Settings

  1. Changes
    - Adds chef image size, shape, and placement settings to veckans-kockar section
    - Settings added:
      - chefImageSize: Size of chef profile image in pixels (default: 112)
      - chefImageShape: Shape of image - round or square (default: round)
      - chefImagePlacement: Placement of image - left, center, or right (default: center)
*/

UPDATE site_sections
SET settings = settings || jsonb_build_object(
  'chefImageSize', 112,
  'chefImageShape', 'round',
  'chefImagePlacement', 'center'
)
WHERE slug = 'veckans-kockar';
