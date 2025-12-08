/*
  # Add Portion Information to Meal Box Templates

  ## Overview
  Add portion count information to meal box templates so chefs and customers can clearly
  see how many portions are included in each meal box. This helps with pricing and
  product selection.

  ## Changes

  1. **meal_box_templates table**
     - Add `suggested_total_portions` column (integer) - Total portions in the meal box
     - Add `suggested_portions_per_dish` column (integer) - Typical portions per dish

  2. **Update existing templates**
     - Set reasonable portion defaults for different template categories
     - Update price recommendations to reflect portion counts

  ## Examples
     - Family meal box: 8 portions (4 dishes × 2 portions each)
     - Student meal box: 4 portions (4 dishes × 1 portion each)
     - Weekend box: 6 portions (3 dishes × 2 portions each)
*/

-- Add portion columns to meal_box_templates
ALTER TABLE meal_box_templates 
ADD COLUMN IF NOT EXISTS suggested_total_portions INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS suggested_portions_per_dish INTEGER DEFAULT 1;

-- Update existing templates with portion information based on category and target audience

-- Klassiska matlådekassar - Standard family portions
UPDATE meal_box_templates 
SET suggested_total_portions = 8,
    suggested_portions_per_dish = 2,
    suggested_price_range = '200-320 SEK (ca 25-40 SEK/portion)'
WHERE category = 'klassiska_matladekassar' 
AND (target_audience LIKE '%familj%' OR target_audience LIKE '%Familj%');

-- Klassiska matlådekassar - Singles and couples
UPDATE meal_box_templates 
SET suggested_total_portions = 4,
    suggested_portions_per_dish = 1,
    suggested_price_range = '150-200 SEK (ca 35-50 SEK/portion)'
WHERE category = 'klassiska_matladekassar' 
AND target_audience NOT LIKE '%familj%' 
AND target_audience NOT LIKE '%Familj%';

-- Specialkassar - Typically premium, smaller portions
UPDATE meal_box_templates 
SET suggested_total_portions = 5,
    suggested_portions_per_dish = 1,
    suggested_price_range = '200-300 SEK (ca 40-60 SEK/portion)'
WHERE category = 'specialkassar_kost_livsstil';

-- Temakassar - Medium portions for variety
UPDATE meal_box_templates 
SET suggested_total_portions = 6,
    suggested_portions_per_dish = 2,
    suggested_price_range = '180-270 SEK (ca 30-45 SEK/portion)'
WHERE category = 'temakassar';

-- Student-oriented boxes - Budget-friendly, good portions
UPDATE meal_box_templates 
SET suggested_total_portions = 5,
    suggested_portions_per_dish = 1,
    suggested_price_range = '120-180 SEK (ca 24-36 SEK/portion)'
WHERE target_audience LIKE '%Student%' 
OR target_audience LIKE '%student%';

-- Family-oriented boxes - Large portions
UPDATE meal_box_templates 
SET suggested_total_portions = 10,
    suggested_portions_per_dish = 2,
    suggested_price_range = '300-450 SEK (ca 30-45 SEK/portion)'
WHERE (target_audience LIKE '%familj%' OR target_audience LIKE '%Familj%')
AND category = 'livssituation_malgrupp';

-- Weekend/special occasion boxes
UPDATE meal_box_templates 
SET suggested_total_portions = 6,
    suggested_portions_per_dish = 2,
    suggested_price_range = '220-350 SEK (ca 35-60 SEK/portion)'
WHERE (name LIKE '%Fredags%' OR name LIKE '%helg%' OR name LIKE '%weekend%');

-- Chef signature boxes - Premium portions
UPDATE meal_box_templates 
SET suggested_total_portions = 6,
    suggested_portions_per_dish = 2,
    suggested_price_range = '250-400 SEK (ca 40-65 SEK/portion)'
WHERE category = 'kurrkok_signatur';

-- Seasonal/theme boxes
UPDATE meal_box_templates 
SET suggested_total_portions = 6,
    suggested_portions_per_dish = 2,
    suggested_price_range = '200-320 SEK (ca 30-55 SEK/portion)'
WHERE category = 'tillfalliga_tematiska';
