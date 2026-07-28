/*
# Add stock decrement trigger and popular products view

1. New Functions
   - `decrement_stock()`: trigger function that decrements product stock on order
2. New Triggers
   - `on_order_item_insert`: fires AFTER INSERT on order_items
3. New Views
   - `popular_products`: products joined with order item counts, sorted by popularity
4. Notes
   - Stock auto-decrements when an order is placed
   - in_stock flag auto-set to false when quantity reaches 0
   - Popular products view respects RLS via security_invoker
*/

-- ============ Stock decrement trigger ============
CREATE OR REPLACE FUNCTION decrement_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
      in_stock = (stock_quantity - NEW.quantity) > 0
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_order_item_insert ON order_items;
CREATE TRIGGER on_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION decrement_stock();

-- ============ Popular products view ============
CREATE OR REPLACE VIEW popular_products AS
SELECT
  p.*,
  COALESCE(SUM(oi.quantity), 0) AS order_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.is_published = true
GROUP BY p.id;

ALTER VIEW popular_products SET (security_invoker = true);
