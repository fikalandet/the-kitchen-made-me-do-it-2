/*
  # Fix Profile Creation and Default Role

  1. Changes
    - Create a trigger function to automatically create profiles for new users
    - Set default role to 'seller' instead of 'buyer' to allow product/accessory creation
    - Insert missing profile for existing user (with email from auth.users)
    - Add database trigger to auto-create profiles on user signup

  2. Security
    - Maintains existing RLS policies
    - Ensures all authenticated users can create products and accessories by default
    - Profile is automatically created when user signs up

  3. Important Notes
    - This fixes the issue where users couldn't create products or accessories
    - The RLS policies require a profile with role='seller' to insert products/accessories
    - By defaulting to 'seller', we enable the chef functionality immediately
*/

-- First, create missing profile for existing user
INSERT INTO profiles (id, role, email, membership_level)
SELECT au.id, 'seller'::user_role, au.email, 'free'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Create a function to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, membership_level)
  VALUES (new.id, 'seller'::user_role, new.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
