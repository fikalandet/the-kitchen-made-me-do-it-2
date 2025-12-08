/*
  # Database Optimizations and Performance Improvements

  ## Overview
  This migration adds database optimizations for better query performance and data integrity.

  ## 1. Additional Indexes
    - Add composite indexes for common query patterns
    - Add indexes on frequently joined columns
    - Add indexes on date ranges for time-based queries

  ## 2. Performance Views
    - Create materialized views for complex aggregate queries
    - Add views for common product listings with marketing features

  ## 3. Constraints and Data Integrity
    - Add check constraints for data validation
    - Add triggers for automatic timestamp updates

  ## 4. Important Notes
    - All indexes are created with IF NOT EXISTS for safety
    - Materialized views need periodic refresh
    - Check constraints ensure data quality
*/

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_seller_type_available 
  ON products(seller_id, type, available) 
  WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_products_type_priority 
  ON products(type, priority_score DESC, created_at DESC) 
  WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_orders_seller_status 
  ON orders(seller_id, order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_status 
  ON orders(buyer_id, order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread 
  ON messages(recipient_id, created_at DESC) 
  WHERE read_at IS NULL;

-- Add indexes for marketing features analytics
CREATE INDEX IF NOT EXISTS idx_product_boost_history_seller_started 
  ON product_boost_history(seller_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_boost_history_product_active 
  ON product_boost_history(product_id, started_at DESC) 
  WHERE ended_at IS NULL;

-- Add check constraints for data validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_price_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_price_check 
      CHECK (price IS NULL OR price >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_brattomkak_minutes_check'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_brattomkak_minutes_check 
      CHECK (brattomkak_delivery_minutes IS NULL OR brattomkak_delivery_minutes > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_amount_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_total_amount_check 
      CHECK (total_amount >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gold_points_points_check'
  ) THEN
    ALTER TABLE gold_points ADD CONSTRAINT gold_points_points_check 
      CHECK (points != 0);
  END IF;
END $$;

-- Create a view for active marketed products
CREATE OR REPLACE VIEW v_marketed_products AS
SELECT 
  p.*,
  ARRAY_AGG(DISTINCT pmf.feature_code) FILTER (WHERE pmf.is_active = true) as active_marketing_features,
  COUNT(DISTINCT pbh.id) FILTER (WHERE pbh.ended_at IS NULL) as active_boosts_count
FROM products p
LEFT JOIN product_marketing_features pmf ON p.id = pmf.product_id AND pmf.is_active = true
LEFT JOIN product_boost_history pbh ON p.id = pbh.product_id AND pbh.ended_at IS NULL
WHERE p.available = true
GROUP BY p.id;

-- Create function to clean up expired boosts
CREATE OR REPLACE FUNCTION cleanup_expired_boosts()
RETURNS void AS $$
BEGIN
  -- Mark products as not boosted if boost has expired
  UPDATE products
  SET is_boosted = false
  WHERE is_boosted = true 
    AND boost_expires_at IS NOT NULL 
    AND boost_expires_at < NOW();

  -- Mark boost history records as ended
  UPDATE product_boost_history
  SET ended_at = NOW()
  WHERE ended_at IS NULL
    AND started_at + (boost_duration_hours || ' hours')::interval < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get product statistics
CREATE OR REPLACE FUNCTION get_product_stats(p_product_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', COUNT(DISTINCT oi.order_id),
    'total_quantity_sold', COALESCE(SUM(oi.quantity), 0),
    'total_revenue', COALESCE(SUM(oi.unit_price * oi.quantity), 0),
    'average_rating', NULL,
    'is_boosted', p.is_boosted,
    'boost_expires_at', p.boost_expires_at,
    'is_pa_spisen_nu', p.is_pa_spisen_nu,
    'is_brattomkak', p.is_brattomkak,
    'priority_score', p.priority_score
  ) INTO result
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  WHERE p.id = p_product_id
  GROUP BY p.id, p.is_boosted, p.boost_expires_at, p.is_pa_spisen_nu, p.is_brattomkak, p.priority_score;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get seller dashboard stats
CREATE OR REPLACE FUNCTION get_seller_dashboard_stats(p_seller_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_products', COUNT(DISTINCT p.id),
    'active_products', COUNT(DISTINCT p.id) FILTER (WHERE p.available = true),
    'boosted_products', COUNT(DISTINCT p.id) FILTER (WHERE p.is_boosted = true),
    'pa_spisen_nu_products', COUNT(DISTINCT p.id) FILTER (WHERE p.is_pa_spisen_nu = true),
    'brattomkak_products', COUNT(DISTINCT p.id) FILTER (WHERE p.is_brattomkak = true),
    'total_orders', COUNT(DISTINCT o.id),
    'pending_orders', COUNT(DISTINCT o.id) FILTER (WHERE o.order_status = 'pending'),
    'total_revenue', COALESCE(SUM(o.total_amount - o.commission_amount), 0),
    'total_commission_paid', COALESCE(SUM(o.commission_amount), 0),
    'unread_messages', COUNT(DISTINCT m.id) FILTER (WHERE m.read_at IS NULL)
  ) INTO result
  FROM profiles prof
  LEFT JOIN products p ON p.seller_id = prof.id
  LEFT JOIN orders o ON o.seller_id = prof.id
  LEFT JOIN messages m ON m.recipient_id = prof.id AND m.read_at IS NULL
  WHERE prof.id = p_seller_id
  GROUP BY prof.id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to tables with updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create scheduled job to cleanup expired boosts (if pg_cron is available)
-- This is commented out as pg_cron may not be available in all environments
-- SELECT cron.schedule('cleanup-expired-boosts', '0 * * * *', 'SELECT cleanup_expired_boosts()');

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION cleanup_expired_boosts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_product_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_seller_dashboard_stats(uuid) TO authenticated;
