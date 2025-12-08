/*
  # Add Coordinates to Profiles

  1. New Fields
    - `latitude` (double precision) - Latitude coordinate for chef location
    - `longitude` (double precision) - Longitude coordinate for chef location

  2. Purpose
    - Enable geographic mapping of chefs on interactive maps
    - Support Mapbox visualization of chef locations
    - Allow geographic search and proximity features

  3. Notes
    - Fields are nullable (NULL by default)
    - Will be populated via geocoding from address fields
    - Used for map display in admin geographic distribution view
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN latitude double precision;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE profiles ADD COLUMN longitude double precision;
  END IF;
END $$;
