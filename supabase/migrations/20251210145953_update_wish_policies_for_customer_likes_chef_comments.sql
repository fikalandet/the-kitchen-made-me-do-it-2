/*
  # Update wish food policies for customer likes and chef-only comments

  1. Changes
    - Update food_wish_likes INSERT policy to allow ALL authenticated users to like (not just chefs)
    - Update food_wish_comments INSERT policy to restrict commenting to chefs only (role = 'seller')
    
  2. Security
    - Customers can now like wishes
    - Only chefs can comment on wishes
*/

-- Drop and recreate the food_wish_likes INSERT policy to allow all authenticated users
DROP POLICY IF EXISTS "Chefs can like wishes" ON food_wish_likes;

CREATE POLICY "Authenticated users can like wishes"
  ON food_wish_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = chef_id);

-- Drop and recreate the food_wish_comments INSERT policy to restrict to chefs only
DROP POLICY IF EXISTS "Authenticated users can comment" ON food_wish_comments;

CREATE POLICY "Chefs can comment on wishes"
  ON food_wish_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'seller'
    )
  );