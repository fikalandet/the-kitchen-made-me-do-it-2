/*
  # Add link type to editorial cards

  1. Changes
    - Adds cta_link_type column to news_editorial_cards
    - Values: 'internal' or 'external'
    - Defaults to 'external' for backwards compatibility

  2. Security
    - No RLS changes needed
*/

ALTER TABLE news_editorial_cards
ADD COLUMN IF NOT EXISTS cta_link_type text DEFAULT 'external';
