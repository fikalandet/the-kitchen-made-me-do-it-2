/*
  # Update Subscription Details Table

  ## Changes
  - Add new columns for subscription configuration
  - Add subscription_item_type and subscription_item_id columns
  - Add delivery method and time window columns
  - Add is_full status column
  - Update policies and triggers
*/

-- Add new columns to subscription_details if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'subscription_item_type'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN subscription_item_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'subscription_item_id'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN subscription_item_id uuid REFERENCES products(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'delivery_time_start'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN delivery_time_start time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'delivery_time_end'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN delivery_time_end time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'delivery_method'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN delivery_method text DEFAULT 'pickup';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'delivery_notes'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN delivery_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_details' AND column_name = 'is_full'
  ) THEN
    ALTER TABLE subscription_details ADD COLUMN is_full boolean DEFAULT false;
  END IF;
END $$;

-- Add constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_subscribers_subscription'
  ) THEN
    ALTER TABLE subscription_details ADD CONSTRAINT valid_subscribers_subscription 
      CHECK (current_subscribers >= 0 AND current_subscribers <= max_subscribers);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_item_type_subscription'
  ) THEN
    ALTER TABLE subscription_details ADD CONSTRAINT valid_item_type_subscription 
      CHECK (subscription_item_type IN ('dish', 'meal_box', 'diy_kit', NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_delivery_method_subscription'
  ) THEN
    ALTER TABLE subscription_details ADD CONSTRAINT valid_delivery_method_subscription 
      CHECK (delivery_method IN ('delivery', 'pickup', NULL));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_details_item_id ON subscription_details(subscription_item_id);
CREATE INDEX IF NOT EXISTS idx_subscription_details_is_full ON subscription_details(is_full) WHERE is_full = false;

-- Function to update is_full status based on subscribers
CREATE OR REPLACE FUNCTION update_subscription_full_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_full := (NEW.current_subscribers >= NEW.max_subscribers);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update is_full status
DROP TRIGGER IF EXISTS trigger_update_subscription_full ON subscription_details;
CREATE TRIGGER trigger_update_subscription_full
  BEFORE UPDATE OF current_subscribers, max_subscribers ON subscription_details
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_full_status();

-- Function to safely increment subscriber count
CREATE OR REPLACE FUNCTION increment_subscriber_count(
  p_product_id uuid,
  p_quantity integer DEFAULT 1
)
RETURNS boolean AS $$
DECLARE
  v_available_spots integer;
  v_rows_updated integer;
BEGIN
  SELECT (max_subscribers - current_subscribers) INTO v_available_spots
  FROM subscription_details
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF v_available_spots IS NULL OR v_available_spots < p_quantity THEN
    RETURN false;
  END IF;

  UPDATE subscription_details
  SET current_subscribers = current_subscribers + p_quantity
  WHERE product_id = p_product_id
    AND (current_subscribers + p_quantity) <= max_subscribers;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  RETURN v_rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available subscription spots
CREATE OR REPLACE FUNCTION get_available_subscription_spots(
  p_product_id uuid
)
RETURNS integer AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM subscription_details
  WHERE product_id = p_product_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  RETURN GREATEST(0, v_subscription.max_subscribers - v_subscription.current_subscribers);
END;
$$ LANGUAGE plpgsql;
