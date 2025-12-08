/*
  # Uppdatera orders-systemet för kockpanelen

  1. Uppdateringar
    - Lägg till kolumner i `orders` för att stödja kockpanelens behov
    - Lägg till kolumner i `order_items` för extra information
    - Skapa funktioner för att generera beställningsnummer

  2. Nya kolumner i orders
    - `order_number` - Unikt beställningsnummer
    - `pickup_delivery_datetime` - När kunden ska hämta/få levererat
    - `delivery_type` - Typ av leverans (pickup/delivery)
    - `delivery_address` - Leveransadress
    - `order_type` - Typ av beställning
    - `customer_message` - Meddelande från kund
    - `customer_allergies` - Kundens allergier

  3. Nya kolumner i order_items
    - `product_name` - Snapshot av produktnamn
    - `subtotal` - Totalpris för denna rad
    - `special_requests` - Speciella önskemål för denna produkt
*/

-- Lägg till nya kolumner i orders om de inte finns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'pickup_delivery_datetime'
  ) THEN
    ALTER TABLE orders ADD COLUMN pickup_delivery_datetime timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_type text CHECK (delivery_type IN ('pickup', 'delivery'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_type text CHECK (order_type IN ('engångsköp', 'prenumeration', 'på_spisen_nu', 'frys', 'event'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_message'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_allergies'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_allergies text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status text DEFAULT 'ny' CHECK (status IN ('ny', 'väntar_på_bekräftelse', 'bekräftad', 'förbereder', 'klar', 'levererad', 'avbruten'));
  END IF;
END $$;

-- Lägg till nya kolumner i order_items om de inte finns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE order_items ADD COLUMN subtotal numeric(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'special_requests'
  ) THEN
    ALTER TABLE order_items ADD COLUMN special_requests text;
  END IF;
END $$;

-- Skapa funktion för att generera unikt beställningsnummer
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
BEGIN
  SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::text, 5, '0') INTO new_number;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Skapa sekvens för beställningsnummer om den inte finns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_number_seq') THEN
    CREATE SEQUENCE order_number_seq START 1;
  END IF;
END $$;

-- Uppdatera befintliga orders utan order_number
UPDATE orders 
SET order_number = generate_order_number()
WHERE order_number IS NULL;

-- Gör order_number unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_unique'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
  END IF;
END $$;
