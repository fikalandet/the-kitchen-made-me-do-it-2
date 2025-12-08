/*
  # Fix Meal Box Templates RLS Policy

  ## Changes
  - Update the SELECT policy on meal_box_templates to allow anonymous users
  - Templates should be viewable by anyone, not just authenticated users
  - This allows chefs to see templates when creating meal boxes
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active meal box templates" ON meal_box_templates;

-- Create new policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can view active meal box templates"
  ON meal_box_templates FOR SELECT
  USING (is_active = true);
