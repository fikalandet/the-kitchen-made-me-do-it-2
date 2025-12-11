/*
  # Add Mock Data for Humörkäk Section

  1. Changes
    - Inserts mock data for humörkäk section with mood cards
    - Creates example mood cards with different emotions
    - Sets up sample subtitle texts with rotation
    - Configures section styling and layout

  2. Mock Data Includes
    - 6 mood cards (Trött, Stressad, Glad, Hungrig, Kall, Varm)
    - Multiple subtitle texts for rotation
    - Section appearance settings
    - Example recipe IDs for mood-to-meal mapping
*/

-- Insert or update humörkäk section with mock data
INSERT INTO site_sections (slug, name, settings, visible, order_index)
VALUES (
  'humorkak',
  'Humörkäk',
  jsonb_build_object(
    'backgroundColor', '#fef9f3',
    'heading', 'Humörkäk',
    'headingFont', 'lobster',
    'headingBold', false,
    'headingAlignment', 'left',
    'headingColor', '#2d3748',
    'subtitleTexts', jsonb_build_array(
      'Vad är du sugen på idag?',
      'Låt ditt humör välja mat',
      'Hitta rätt käk för känslan',
      'Mat som matchar ditt humör'
    ),
    'subtitleRotationInterval', 10000,
    'subtitlePlacement', 'inline',
    'subtitleColor', '#718096',
    'mood_cards', jsonb_build_array(
      jsonb_build_object(
        'id', 'mood-tired',
        'name', 'Trött som ett as',
        'description', 'Energigivande comfort food',
        'icon', '😴',
        'front_bg_color', '#ffd6a5',
        'front_shape', 'rounded',
        'back_title', 'Energi på tallriken',
        'back_text', 'När du behöver en boost av energi och gott comfort food'
      ),
      jsonb_build_object(
        'id', 'mood-stressed',
        'name', 'Stressad',
        'description', 'Lugnande och näringsrik mat',
        'icon', '😰',
        'front_bg_color', '#a8dadc',
        'front_shape', 'bubble',
        'back_title', 'Lugna ner tempot',
        'back_text', 'Avkopplande rätter som hjälper dig att varva ner'
      ),
      jsonb_build_object(
        'id', 'mood-happy',
        'name', 'Glad & feststämning',
        'description', 'Festliga rätter att fira med',
        'icon', '🎉',
        'front_bg_color', '#ffb5e8',
        'front_shape', 'wavy',
        'back_title', 'Fixa till firandet',
        'back_text', 'Glädjefyllda rätter perfekta för festliga tillfällen'
      ),
      jsonb_build_object(
        'id', 'mood-hungry',
        'name', 'Jättehungrig',
        'description', 'Stora, mättande portioner',
        'icon', '🤤',
        'front_bg_color', '#c9e4ca',
        'front_shape', 'rounded',
        'back_title', 'Mättnad garanterad',
        'back_text', 'Generösa portioner som verkligen mättar'
      ),
      jsonb_build_object(
        'id', 'mood-cold',
        'name', 'Frusen',
        'description', 'Värmande och mysig mat',
        'icon', '🥶',
        'front_bg_color', '#ffc6a5',
        'front_shape', 'bubble',
        'back_title', 'Värm dig inifrån',
        'back_text', 'Värmande soppor, grytor och drycker'
      ),
      jsonb_build_object(
        'id', 'mood-hot',
        'name', 'Svettas som fan',
        'description', 'Svalkande och lätta rätter',
        'icon', '🥵',
        'front_shape', 'wavy',
        'front_bg_color', '#b4e7ff',
        'back_title', 'Kylig och fräsch',
        'back_text', 'Uppfriskande rätter för varma dagar'
      )
    ),
    'mood_meals', jsonb_build_array(
      jsonb_build_object(
        'mood_id', 'mood-tired',
        'recipe_ids', jsonb_build_array('recipe-1', 'recipe-2', 'recipe-3')
      ),
      jsonb_build_object(
        'mood_id', 'mood-stressed',
        'recipe_ids', jsonb_build_array('recipe-4', 'recipe-5', 'recipe-6')
      ),
      jsonb_build_object(
        'mood_id', 'mood-happy',
        'recipe_ids', jsonb_build_array('recipe-7', 'recipe-8', 'recipe-9')
      ),
      jsonb_build_object(
        'mood_id', 'mood-hungry',
        'recipe_ids', jsonb_build_array('recipe-10', 'recipe-11', 'recipe-12')
      ),
      jsonb_build_object(
        'mood_id', 'mood-cold',
        'recipe_ids', jsonb_build_array('recipe-13', 'recipe-14', 'recipe-15')
      ),
      jsonb_build_object(
        'mood_id', 'mood-hot',
        'recipe_ids', jsonb_build_array('recipe-16', 'recipe-17', 'recipe-18')
      )
    )
  ),
  true,
  8
)
ON CONFLICT (slug)
DO UPDATE SET
  settings = EXCLUDED.settings,
  visible = EXCLUDED.visible,
  order_index = EXCLUDED.order_index,
  updated_at = now();
