/*
  # Add Date and Recurring Fields to Delivery Sessions

  1. Changes
    - Add `datum` field to store specific date for delivery session
    - Add recurring weekday fields (alla_måndagar, alla_tisdagar, etc.)
    - Make day_of_week nullable since we now support specific dates
  
  2. Notes
    - Either `datum` or `day_of_week` (with recurring flags) should be set
    - This allows scheduling both specific date sessions and recurring sessions
*/

ALTER TABLE chef_delivery_sessions
  ADD COLUMN IF NOT EXISTS datum date,
  ADD COLUMN IF NOT EXISTS alla_måndagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_tisdagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_onsdagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_torsdagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_fredagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_lördagar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alla_söndagar boolean DEFAULT false;

ALTER TABLE chef_delivery_sessions
  ALTER COLUMN day_of_week DROP NOT NULL;