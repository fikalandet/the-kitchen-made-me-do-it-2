/*
  # Add Template Usage Tracking

  ## Overview
  Track which templates are being used by chefs to understand popularity and improve
  the template library over time.

  ## 1. New Tables
    
    ### `template_usage_stats`
    Track when templates are selected and used
    - `id` (uuid, primary key)
    - `template_id` (uuid, references meal_box_templates or subscription_templates)
    - `template_type` (text) - 'meal_box' or 'subscription'
    - `chef_id` (uuid, references profiles)
    - `product_id` (uuid, references products) - NULL if product not yet created
    - `was_published` (boolean) - Whether the product was actually published
    - `created_at` (timestamptz)

  ## 2. Views
    
    ### `template_popularity`
    Aggregated view showing template usage statistics
    - Shows total uses, publish rate, and recent usage

  ## 3. Security
    - Enable RLS on template_usage_stats
    - Chefs can only create records for themselves
    - Only admins can view usage statistics

  ## 4. Updates to Existing Tables
    - Add `usage_count` to meal_box_templates for quick popularity display
    - Add `usage_count` to subscription_templates for quick popularity display
    - Add `suggested_price_range` to meal_box_templates
    - Add `suggested_delivery_days` to meal_box_templates
    - Add `suggested_cuisine_types` to meal_box_templates
    - Add `suggested_food_preferences` to meal_box_templates
*/

-- Create template usage tracking table
CREATE TABLE IF NOT EXISTS template_usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('meal_box', 'subscription')),
  chef_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  was_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE template_usage_stats ENABLE ROW LEVEL SECURITY;

-- Template usage stats policies
CREATE POLICY "Chefs can create their own usage stats"
  ON template_usage_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

CREATE POLICY "Chefs can view their own usage stats"
  ON template_usage_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = chef_id);

CREATE POLICY "Admins can view all usage stats"
  ON template_usage_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add usage_count columns to template tables
ALTER TABLE meal_box_templates 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suggested_price_range TEXT,
ADD COLUMN IF NOT EXISTS suggested_delivery_days TEXT[],
ADD COLUMN IF NOT EXISTS suggested_cuisine_types TEXT[],
ADD COLUMN IF NOT EXISTS suggested_food_preferences TEXT[];

ALTER TABLE subscription_templates 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suggested_price_range TEXT,
ADD COLUMN IF NOT EXISTS suggested_frequency TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_template_usage_stats_template 
ON template_usage_stats(template_id, template_type);

CREATE INDEX IF NOT EXISTS idx_template_usage_stats_chef 
ON template_usage_stats(chef_id);

CREATE INDEX IF NOT EXISTS idx_template_usage_stats_published 
ON template_usage_stats(was_published) 
WHERE was_published = true;

-- Create view for template popularity
CREATE OR REPLACE VIEW template_popularity AS
SELECT 
  template_type,
  template_id,
  COUNT(*) as total_uses,
  COUNT(*) FILTER (WHERE was_published = true) as published_count,
  COUNT(*) FILTER (WHERE was_published = true)::float / NULLIF(COUNT(*), 0) as publish_rate,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as uses_last_30_days,
  MAX(created_at) as last_used
FROM template_usage_stats
GROUP BY template_type, template_id;

-- Update existing templates with helpful suggestions
UPDATE meal_box_templates 
SET suggested_price_range = '150-250 SEK',
    suggested_delivery_days = ARRAY['Fredag', 'Lördag']
WHERE category = 'klassiska_matladekassar';

UPDATE meal_box_templates 
SET suggested_price_range = '200-350 SEK',
    suggested_food_preferences = ARRAY['vegetarisk', 'vegansk', 'glutenfri', 'laktosfri']
WHERE category = 'specialkassar_kost_livsstil';

UPDATE meal_box_templates 
SET suggested_price_range = '180-300 SEK',
    suggested_cuisine_types = ARRAY['italiensk', 'asiatisk', 'mexikansk', 'medelhavet']
WHERE category = 'temakassar';

UPDATE meal_box_templates 
SET suggested_price_range = '120-200 SEK',
    suggested_delivery_days = ARRAY['Måndag', 'Onsdag', 'Fredag']
WHERE category = 'livssituation_malgrupp' AND target_audience LIKE '%Student%';

UPDATE meal_box_templates 
SET suggested_price_range = '250-400 SEK'
WHERE category = 'livssituation_malgrupp' AND target_audience LIKE '%familj%';

UPDATE meal_box_templates 
SET suggested_delivery_days = ARRAY['Fredag']
WHERE name LIKE '%Fredagsmyset%' OR name LIKE '%Fredags%';

UPDATE subscription_templates 
SET suggested_frequency = 'weekly',
    suggested_price_range = '100-180 SEK per leverans'
WHERE suggested_item_type = 'dish';

UPDATE subscription_templates 
SET suggested_frequency = 'weekly',
    suggested_price_range = '200-350 SEK per leverans'
WHERE suggested_item_type = 'meal_box';

UPDATE subscription_templates 
SET suggested_frequency = 'weekly',
    suggested_price_range = '150-250 SEK per leverans'
WHERE suggested_item_type = 'diy_kit';
