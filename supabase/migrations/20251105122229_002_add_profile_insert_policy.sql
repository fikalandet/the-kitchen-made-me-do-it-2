/*
  # Add Profile Insert Policy

  1. Changes
    - Add INSERT policy for profiles table to allow users to create their own profile during signup
    
  2. Security
    - Users can only insert a profile with their own auth.uid() as the id
    - This allows the signup flow to work correctly while maintaining security
*/

-- Allow authenticated users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
