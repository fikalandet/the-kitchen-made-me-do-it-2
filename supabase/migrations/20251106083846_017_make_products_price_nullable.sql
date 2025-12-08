/*
  # Make products.price column nullable

  1. Problem
    - The products.price column has NOT NULL constraint
    - For dishes with size-based pricing (price_small, price_standard, price_large, price_package),
      the base price field may be null since pricing is defined by the size-specific columns
    - This prevents creating dishes with size-based pricing

  2. Solution
    - Make the price column nullable to allow products to use size-based pricing instead
    - Products can have either a single price OR size-based pricing (small/standard/large/package)

  3. Changes
    - Alter products.price column to allow NULL values

  4. Security
    - No changes to RLS policies
    - Maintains data integrity - at least one price field (price or size-specific) should be set
*/

-- Make price column nullable to support size-based pricing
ALTER TABLE products 
ALTER COLUMN price DROP NOT NULL;
