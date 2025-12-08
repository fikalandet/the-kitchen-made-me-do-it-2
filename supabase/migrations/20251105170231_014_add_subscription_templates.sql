/*
  # Add Subscription Templates

  ## Overview
  Creates a templates table for subscription products to provide inspiration
  to chefs when creating subscription offerings.

  ## 1. New Tables
    
    ### `subscription_templates`
    Pre-defined subscription templates with inspirational variants
    - `id` (uuid, primary key)
    - `name` (text) - Template name
    - `description` (text) - Description of the template
    - `target_audience` (text) - Who it's for
    - `suggested_item_type` (text) - Suggested type: dish, meal_box, diy_kit
    - `image_url` (text) - Optional image for the template
    - `is_active` (boolean) - Whether template is available
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on subscription_templates
    - Templates are public (read-only for everyone)

  ## 3. Sample Templates
    - Insert popular subscription templates for inspiration
*/

-- Create subscription templates table
CREATE TABLE IF NOT EXISTS subscription_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_audience text,
  suggested_item_type text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_suggested_type CHECK (suggested_item_type IN ('dish', 'meal_box', 'diy_kit', NULL))
);

-- Enable RLS
ALTER TABLE subscription_templates ENABLE ROW LEVEL SECURITY;

-- Subscription templates policies (public read)
CREATE POLICY "Anyone can view active subscription templates"
  ON subscription_templates FOR SELECT
  USING (is_active = true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_subscription_templates_active ON subscription_templates(is_active) WHERE is_active = true;

-- Insert sample subscription templates
INSERT INTO subscription_templates (name, description, target_audience, suggested_item_type, is_active) VALUES
  ('Veckorätt-prenumeration', 'En ny favorit maträtt varje vecka. Perfekt för den som vill ha variation utan att behöva planera.', 'Singlar och par', 'dish', true),
  ('Familjens Matlådekasse', 'Få en komplett matlådekasse levererad varje vecka med allt familjen behöver. Enkelt och tidssparande!', 'Familjer', 'meal_box', true),
  ('Matlagningskursen', 'Lär dig laga nya rätter med vårt laga-själv-kit som levereras varje vecka med recept och alla ingredienser.', 'Matlagningsintresserade', 'diy_kit', true),
  ('Lunchprenumeration', 'Välj din favorit lunch som levereras varje vardag. Spar tid och få näringsrik mat på jobbet.', 'Yrkesverksamma', 'dish', true),
  ('Hälsoveckan', 'Få hälsosamma, balanserade måltider levererade regelbundet. Perfekt för dig som vill äta rätt utan krångel.', 'Hälsomedvetna', 'meal_box', true),
  ('Gourmet Hemma', 'Prenumerera på våra finare rätter och få restaurangupplevelsen hem till dig varje vecka.', 'Matälskare', 'dish', true),
  ('Barnvänliga Veckan', 'Maträtter som barnen älskar, med näringsrikt innehåll. Levereras varje vecka så du slipper stressen.', 'Föräldrar', 'meal_box', true),
  ('Kryddkit-prenumeration', 'Utforska nya smaker varje månad med vårt laga-själv-kit fyllt med spännande kryddor och recept.', 'Äventyrliga matlagare', 'diy_kit', true),
  ('Vegetarisk Vecka', 'Prenumerera på vegetariska rätter eller kassar och få inspiration till en grönare livsstil.', 'Vegetarianer', 'meal_box', true),
  ('Matlådan för Studenten', 'Prisvärd och mättande mat levererad regelbundet. Fokus på värde för pengarna och god smak.', 'Studenter', 'dish', true),
  ('Helgens Festmat', 'Få festliga rätter levererade varje fredag för en perfekt helgstart. Slipp planera - vi fixar det!', 'Sociala matälskare', 'dish', true),
  ('Par-prenumerationen', 'Romantiska måltider för två levererade varje vecka. Perfekt för myskvällar hemma.', 'Par', 'meal_box', true)
ON CONFLICT DO NOTHING;
