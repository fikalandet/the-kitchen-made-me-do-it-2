/*
  # Fix RLS Infinite Recursion

  1. Problem
    - RLS policies that query the profiles table cause infinite recursion
    - This happens because checking a policy requires reading profiles, which triggers the same policy check
    
  2. Solution
    - Replace profile lookups with direct auth.uid() checks
    - Since we now auto-create profiles with 'seller' role by default, we can simplify policies
    - Remove the role check from INSERT policies since all authenticated users are sellers by default
    
  3. Changes
    - Simplify products INSERT policy - just check seller_id matches auth.uid()
    - Simplify accessories INSERT policy - just check seller_id matches auth.uid()
    - Fix products SELECT policy to not query profiles table
    - Remove problematic admin policy from profiles table
    
  4. Security
    - Maintains security by checking auth.uid() directly
    - All authenticated users can create products/accessories (they're all sellers by default)
    - Users can only manage their own data
*/

-- Drop and recreate products policies without profile lookups
DROP POLICY IF EXISTS "Sellers can insert products" ON products;
CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can view their own products" ON products;
CREATE POLICY "Sellers can view their own products"
  ON products FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

-- Drop and recreate accessories policies without profile lookups
DROP POLICY IF EXISTS "Sellers can create accessories" ON accessories;
CREATE POLICY "Sellers can create accessories"
  ON accessories FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- Remove the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Ensure users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Keep the seller profiles visibility (no recursion here since it doesn't query profiles in subquery)
DROP POLICY IF EXISTS "Sellers can view all seller profiles" ON profiles;
CREATE POLICY "Sellers can view all seller profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'seller'::user_role OR auth.uid() = id);
