/*
  # Add Categories to Meal Box Templates

  1. Changes
    - Add `category` column to meal_box_templates to group templates by theme
    - Add `icon_emoji` column for visual representation of categories
    - Update existing templates with appropriate categories
    - Add more template examples across different categories

  2. Categories
    - klassiska_matladekassar: Traditional meal boxes (Klassiska matlådekassar)
    - specialkassar_kost_livsstil: Diet & lifestyle specific boxes (Specialkassar efter kost & livsstil)
    - temakassar: Themed boxes by cuisine type (Temakassar)
    - livssituation_malgrupp: Life situation & target group (Livssituation & målgrupp)
    - kurrkok_signatur: Chef's signature boxes (Kurr-kockens signaturkasse)
    - tillfalliga_tematiska: Occasion/seasonal boxes (Tillfälliga/tematiska kassar)

  3. Security
    - No changes to RLS policies
*/

-- Add category and icon_emoji columns
ALTER TABLE meal_box_templates 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS icon_emoji TEXT;

-- Update existing templates with categories
UPDATE meal_box_templates 
SET category = 'klassiska_matladekassar',
    icon_emoji = '🛍️'
WHERE name IN ('Veckans klassiker', 'Snabbt & Enkelt');

UPDATE meal_box_templates 
SET category = 'livssituation_malgrupp',
    icon_emoji = '💚'
WHERE name IN ('Barnfavoriter', 'Hälsosam vecka');

UPDATE meal_box_templates 
SET category = 'temakassar',
    icon_emoji = '🍜'
WHERE name = 'Världens smaker';

-- Add more template examples

-- Klassiska matlådekassar (more examples)
INSERT INTO meal_box_templates (name, description, target_audience, category, icon_emoji, is_active)
VALUES
  ('Allround-kassen', 'En mångsidig veckomeny med olika typer av rätter - både snabba och mer avancerade.', 'Alla', 'klassiska_matladekassar', '🛍️', true);

-- Specialkassar efter kost & livsstil
INSERT INTO meal_box_templates (name, description, target_audience, category, icon_emoji, is_active)
VALUES
  ('Vegetariska kassen', 'Helt utan kött eller fisk', 'Vegetarianer', 'specialkassar_kost_livsstil', '🌱', true),
  ('Veganska kassen', 'Inget animaliskt alls, inklusive mejeriprodukter och ägg', 'Veganer', 'specialkassar_kost_livsstil', '🌱', true),
  ('Glutenfria kassen', 'Alla rätter är glutenfria', 'Personer med glutenintolerans', 'specialkassar_kost_livsstil', '🌱', true),
  ('Laktosfria kassen', 'Anpassad för laktosintoleranta', 'Personer med laktosintolerans', 'specialkassar_kost_livsstil', '🌱', true),
  ('Low Carb-kassen', 'För dig som vill äta mindre kolhydrater', 'Hälsomedvetna', 'specialkassar_kost_livsstil', '🌱', true),
  ('Högproteinkassen', 'För träning och återhämtning', 'Aktiva & träningsintresserade', 'specialkassar_kost_livsstil', '🌱', true),
  ('Paleo-kassen', 'Stenålderskost med naturliga råvaror', 'Paleo-följare', 'specialkassar_kost_livsstil', '🌱', true),
  ('KETO-kassen', 'Ketogen kost med hög fetthalt', 'KETO-följare', 'specialkassar_kost_livsstil', '🌱', true),
  ('Klimatsmart kassen', 'Hållbara måltider med lågt klimatavtryck', 'Miljömedvetna', 'specialkassar_kost_livsstil', '🌱', true);

-- Temakassar (cuisine-based themes)
INSERT INTO meal_box_templates (name, description, target_audience, category, icon_emoji, is_active)
VALUES
  ('Italienska veckan', 'Autentiska italienska rätter från olika regioner', 'Italiensk mat-älskare', 'temakassar', '🍜', true),
  ('Asiatiska smakupplevelsen', 'En resa genom Asiens kök - från Thailand till Japan', 'Fans av asiatisk mat', 'temakassar', '🍜', true),
  ('Mexikanska fiestan', 'Färgstarka och kryddiga rätter från Mexico', 'Älskare av mexikansk mat', 'temakassar', '🍜', true),
  ('Medelhavsresan', 'Soltörstande smaker från Medelhavet', 'Medelhavskök-fans', 'temakassar', '🍜', true),
  ('Svenska klassiker', 'Traditionell husmanskost i modern tappning', 'Husmanskost-älskare', 'temakassar', '🍜', true);

-- Livssituation & målgrupp
INSERT INTO meal_box_templates (name, description, target_audience, category, icon_emoji, is_active)
VALUES
  ('Studentkassen', 'Budgetvänliga och enkla rätter perfekta för studenter', 'Studenter', 'livssituation_malgrupp', '💚', true),
  ('Seniorernas favoriter', 'Mjuka, lätttuggade och näringsrika måltider', 'Seniorer', 'livssituation_malgrupp', '💚', true),
  ('Graviditetskassen', 'Näringsrikt för blivande mammor', 'Gravida', 'livssituation_malgrupp', '💚', true),
  ('Aktiva familjens val', 'Energigivande måltider för aktiva familjer', 'Aktiva familjer', 'livssituation_malgrupp', '💚', true),
  ('Singelportioner', 'Perfekt anpassade för en person', 'Singlar', 'livssituation_malgrupp', '💚', true),
  ('Storhushållet', 'Storkok för stora familjer eller sällskap', 'Stora familjer', 'livssituation_malgrupp', '💚', true),
  ('Lunchlådan', 'Perfekta rätter att ta med till jobbet', 'Yrkesarbetande', 'livssituation_malgrupp', '💚', true),
  ('Fredagsmyset', 'Goda rätter för en mysig fredagskväll', 'Alla', 'livssituation_malgrupp', '💚', true);

-- Tillfälliga/tematiska kassar
INSERT INTO meal_box_templates (name, description, target_audience, category, icon_emoji, is_active)
VALUES
  ('Julens smaker', 'Traditionell julmat med moderna varianter', 'Alla under juletid', 'tillfalliga_tematiska', '🎁', true),
  ('Påskkassen', 'Våriga och fräscha påskrecepten', 'Alla under påsk', 'tillfalliga_tematiska', '🎁', true),
  ('Midsommartema', 'Svenska klassiker för midsommarfirande', 'Alla under midsommar', 'tillfalliga_tematiska', '🎁', true),
  ('Grillkassen', 'Perfekt för sommargrillen', 'Grillälskare', 'tillfalliga_tematiska', '🎁', true),
  ('Höstens skördefest', 'Säsongsbetonade hösträtter', 'Alla under hösten', 'tillfalliga_tematiska', '🎁', true);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_meal_box_templates_category 
ON meal_box_templates(category) 
WHERE is_active = true;
