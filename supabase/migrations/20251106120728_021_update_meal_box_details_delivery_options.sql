/*
  # Update Meal Box Delivery Options

  ## Overview
  Update the meal_box_details table to support both pickup and delivery options with 
  separate time slots for each. This allows chefs to offer pickup during one time window 
  and delivery during another time window.

  ## Changes

  1. **meal_box_details table**
     - Add `offers_pickup` (boolean) - Whether pickup is available
     - Add `offers_delivery` (boolean) - Whether delivery is available
     - Add `pickup_time_start` (time) - Pickup window start time
     - Add `pickup_time_end` (time) - Pickup window end time
     - Keep existing delivery_time_start and delivery_time_end for delivery windows
     - Remove old `delivery_method` field (replaced by the two boolean flags)

  ## Migration Strategy
     - Preserve existing data by migrating old delivery_method values
     - Set reasonable defaults for new fields
*/

-- Add new columns for dual delivery options
ALTER TABLE meal_box_details
ADD COLUMN IF NOT EXISTS offers_pickup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS offers_delivery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_time_start TIME,
ADD COLUMN IF NOT EXISTS pickup_time_end TIME;

-- Migrate existing data based on delivery_method if it exists
DO $$
BEGIN
  -- Check if delivery_method column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meal_box_details' 
    AND column_name = 'delivery_method'
  ) THEN
    -- If delivery_method was 'pickup', enable pickup and migrate times
    UPDATE meal_box_details
    SET offers_pickup = true,
        offers_delivery = false,
        pickup_time_start = delivery_time_start,
        pickup_time_end = delivery_time_end
    WHERE delivery_method = 'pickup';

    -- If delivery_method was 'delivery', enable delivery and keep existing times
    UPDATE meal_box_details
    SET offers_pickup = false,
        offers_delivery = true
    WHERE delivery_method = 'delivery';

    -- For any null delivery_method, default to pickup only
    UPDATE meal_box_details
    SET offers_pickup = true,
        offers_delivery = false
    WHERE delivery_method IS NULL;

    -- Drop the old delivery_method column
    ALTER TABLE meal_box_details
    DROP COLUMN delivery_method;
  END IF;
END $$;
