/*
  # Add admin update policy for profiles

  1. Security Changes
    - Add policy allowing admins to update any profile
    - This enables admin panel functionality for managing chef commissions and other profile fields

  2. Purpose
    - Allow admins to update chef profiles from the admin panel
*/

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );