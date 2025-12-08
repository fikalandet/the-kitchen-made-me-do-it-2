/*
  # Add registration fee refund fields

  1. New Fields in profiles
    - `temporary_commission_is_registration_refund` (boolean) - flag to link temporary commission to registration fee refund
    - `registration_fee_amount` (numeric) - total registration fee amount (e.g., 1700)
    - `registration_fee_refunded_amount` (numeric) - amount refunded so far via commission
    - `registration_fee_refund_completed` (boolean) - flag indicating refund is complete

  2. Purpose
    - Track registration fee refund via increased commission
    - Automatically deactivate temporary commission when refund is complete
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'temporary_commission_is_registration_refund'
  ) THEN
    ALTER TABLE profiles ADD COLUMN temporary_commission_is_registration_refund boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_fee_amount'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_fee_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_fee_refunded_amount'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_fee_refunded_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'registration_fee_refund_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN registration_fee_refund_completed boolean DEFAULT false;
  END IF;
END $$;