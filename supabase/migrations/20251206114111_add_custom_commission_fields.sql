/*
  # Add custom commission fields to profiles

  1. Changes
    - Add `has_custom_commission` (boolean) - flag to activate temporary commission
    - Add `custom_commission_percent` (numeric) - temporary commission percentage
    - Add `custom_commission_valid_from` (date) - start date for temporary commission
    - Add `custom_commission_valid_to` (date) - end date for temporary commission (null = indefinite)
    - Add `custom_commission_note` (text) - reason/note for temporary commission

  2. Purpose
    - Allow admins to set temporary commission rates for individual chefs
    - Override standard membership-based commission when active
    - Track validity period for temporary rates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_custom_commission'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_custom_commission boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_commission_percent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_commission_percent numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_commission_valid_from'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_commission_valid_from date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_commission_valid_to'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_commission_valid_to date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_commission_note'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_commission_note text;
  END IF;
END $$;