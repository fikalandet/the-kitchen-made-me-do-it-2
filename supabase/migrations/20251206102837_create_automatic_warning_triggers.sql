/*
  # Skapa automatiska varningar från feedback

  1. Funktion
    - Skapar funktion för att skapa automatiska varningar från negativ feedback

  2. Trigger (TODO)
    - När orders får dålig rating → skapa varning
    - När products får negativ feedback → skapa varning
    - När message_threads flaggas som toxiska → skapa varning

  3. Notering
    - Eftersom det inte finns dedikerad ratings-tabell än, skapar vi en funktion
      som kan användas manuellt eller från frontend när feedback lämnas
*/

-- Funktion för att skapa automatisk varning från produktfeedback
CREATE OR REPLACE FUNCTION create_warning_from_feedback()
RETURNS TRIGGER AS $$
DECLARE
  v_chef_id uuid;
  v_product_name text;
  v_severity text;
BEGIN
  -- Hämta kock-id och produktnamn
  SELECT seller_id, name INTO v_chef_id, v_product_name
  FROM products
  WHERE id = NEW.id;

  -- Om feedback innehåller negativa nyckelord eller är kort och negativ
  IF NEW.feedback IS NOT NULL AND LENGTH(NEW.feedback) > 0 THEN
    -- Enkel heuristik: om feedbacken innehåller negativa ord
    IF NEW.feedback ILIKE '%dålig%' 
       OR NEW.feedback ILIKE '%äcklig%'
       OR NEW.feedback ILIKE '%smaklös%'
       OR NEW.feedback ILIKE '%inte bra%'
       OR NEW.feedback ILIKE '%besviken%'
       OR NEW.feedback ILIKE '%inte god%' THEN
      
      -- Bestäm severity baserat på ordval
      IF NEW.feedback ILIKE '%äcklig%' OR NEW.feedback ILIKE '%fruktansvärd%' THEN
        v_severity := 'hög';
      ELSE
        v_severity := 'medel';
      END IF;

      -- Skapa varning
      INSERT INTO chef_warnings (
        chef_id,
        type,
        severity,
        status,
        message,
        source,
        is_new,
        related_id,
        short_summary
      ) VALUES (
        v_chef_id,
        'Annat',
        v_severity,
        'öppen',
        'Negativ feedback på produkt "' || v_product_name || '": ' || NEW.feedback,
        'feedback',
        true,
        NEW.id,
        'Negativ feedback: ' || v_product_name
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TODO: Skapa trigger när orders får ratings
-- TODO: Skapa trigger när message_threads flaggas som toxiska
-- Dessa triggers skapas när ratings- och moderation-tabellerna finns

-- Kommentar för framtida implementation:
-- När en ratings-tabell skapas, använd liknande logik:
-- CREATE TRIGGER auto_warning_from_low_rating
-- AFTER INSERT ON ratings
-- FOR EACH ROW
-- WHEN (NEW.rating <= 2)
-- EXECUTE FUNCTION create_warning_from_low_rating();
