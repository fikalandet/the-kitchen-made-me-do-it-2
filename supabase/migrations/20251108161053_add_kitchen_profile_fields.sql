/*
  # Add Kitchen Profile Fields

  1. New Columns
    - `address` (text) - Street address
    - `postal_code` (text) - Postal code
    - `city` (text) - City name
    - `kitchen_name` (text) - Kitchen name (separate from display_name)
    - `description` (text) - Kitchen description
    - `profile_image_url` (text) - Profile image URL
    - `banner_image_url` (text) - Banner image URL
    - `welcome_video_url` (text) - Welcome video URL
    - `show_obs_notification` (boolean) - Show OBS notification flag
    - `obs_notification_text` (text) - OBS notification text
    - `instagram` (text) - Instagram handle
    - `tiktok` (text) - TikTok handle
    - `facebook` (text) - Facebook URL
    - `other_contact` (text) - Other contact information
    - `pickup_available` (boolean) - Pickup available flag
    - `delivery_available` (boolean) - Delivery available flag
    - `max_delivery_distance` (integer) - Max delivery distance in km
    - `delivery_price_per_km` (numeric) - Price per kilometer
    - `free_delivery_threshold` (numeric) - Free delivery threshold amount
    - `delivery_customer_notes` (text) - Customer notes for delivery
    - `delivery_pricing_type` (text) - Type: 'per_km' or 'distance_range'
    - `delivery_distance_ranges` (jsonb) - Array of distance ranges with prices

  2. Notes
    - All fields have default values where appropriate
    - No breaking changes to existing data
*/

-- Add address fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text DEFAULT '';

-- Add kitchen info fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kitchen_name text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_image_url text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_image_url text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_video_url text DEFAULT '';

-- Add OBS notification fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_obs_notification boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS obs_notification_text text DEFAULT '';

-- Add social media fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tiktok text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS other_contact text DEFAULT '';

-- Add delivery settings fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pickup_available boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_delivery_distance integer DEFAULT 10;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_price_per_km numeric(10,2) DEFAULT 15.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_delivery_threshold numeric(10,2) DEFAULT 500.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_customer_notes text DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_pricing_type text DEFAULT 'per_km';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delivery_distance_ranges jsonb DEFAULT '[]'::jsonb;