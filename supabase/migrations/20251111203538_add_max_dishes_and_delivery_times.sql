/*
  # Add max dishes and delivery times to daily capacity settings

  1. Changes
    - Add max_dishes field to track maximum number of dishes that can be cooked
    - Add delivery_start_time and delivery_end_time for delivery windows
    - These fields allow separate time windows for cooking vs delivery

  2. Notes
    - max_dishes is different from max_portions_per_dish
    - Delivery times are separate from cooking times to avoid conflicts
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_capacity_settings' AND column_name = 'max_dishes'
  ) THEN
    ALTER TABLE daily_capacity_settings ADD COLUMN max_dishes int;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_capacity_settings' AND column_name = 'delivery_start_time'
  ) THEN
    ALTER TABLE daily_capacity_settings ADD COLUMN delivery_start_time time;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_capacity_settings' AND column_name = 'delivery_end_time'
  ) THEN
    ALTER TABLE daily_capacity_settings ADD COLUMN delivery_end_time time;
  END IF;
END $$;