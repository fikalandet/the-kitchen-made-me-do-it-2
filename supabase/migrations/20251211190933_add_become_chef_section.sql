/*
  # Lägg till Bli en Kitchen-kock sektion

  1. Nytt
    - Lägger till en ny post i site_sections för "Bli en Kitchen-kock" sektionen
    - Sätter standardinställningar för bakgrund, rubrik, text, knapp och fördelar

  2. Säkerhet
    - Inga ändringar i RLS (site_sections hanteras redan)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM site_sections WHERE slug = 'bli-en-kitchen-kock'
  ) THEN
    INSERT INTO site_sections (
      slug,
      name,
      order_index,
      visible,
      settings
    ) VALUES (
      'bli-en-kitchen-kock',
      'Bli en Kitchen-kock',
      1000,
      true,
      jsonb_build_object(
        'backgroundColor', '#a1c798',
        'heading', 'Bli en Kitchen-kock',
        'headingFont', 'lobster',
        'headingBold', false,
        'headingAlignment', 'center',
        'headingColor', '#374151',
        'subtitleTexts', jsonb_build_array('Dela din passion för matlagning och tjäna pengar på det du älskar'),
        'subtitleRotationInterval', 10000,
        'subtitleColor', '#6b7280',
        'contentBox', jsonb_build_object(
          'bgColor', '#f6f2e0',
          'width', 100,
          'opacity', 100,
          'borderRadius', 16
        ),
        'description', 'Dela din passion för matlagning och tjäna pengar på det du älskar. Bli en del av Sveriges största community för hemmakockar.',
        'descriptionFont', 'sans',
        'descriptionBold', false,
        'descriptionSize', 18,
        'descriptionColor', '#374151',
        'image', jsonb_build_object(
          'url', '',
          'position', 'none',
          'hasBorder', false,
          'borderColor', '#56c5c5',
          'borderWidth', 4,
          'borderRadius', 'small'
        ),
        'cta', jsonb_build_object(
          'label', 'Ansök nu',
          'href', '/bli-kock',
          'bgColor', '#56c5c5',
          'textColor', '#ffffff',
          'font', 'sans',
          'bold', true,
          'italic', false,
          'uppercase', false,
          'size', 16
        ),
        'benefits', jsonb_build_array(
          jsonb_build_object(
            'id', 'benefit-1',
            'icon', '💰',
            'text', 'Tjäna pengar på din passion'
          ),
          jsonb_build_object(
            'id', 'benefit-2',
            'icon', '🏆',
            'text', 'Bygg din egen profil'
          ),
          jsonb_build_object(
            'id', 'benefit-3',
            'icon', '🤝',
            'text', 'Bli en del av communityn'
          )
        ),
        'benefitsPerRow', 3
      )
    );
  END IF;
END $$;
