/*
# Auto-link products to "Все" category

1. Purpose
   When a product is added to any category, it should automatically appear
   in the "Все" (All) category. We use the existing show_in_all_categories
   flag as the mechanism: any product with a non-null category_id gets
   show_in_all_categories = true automatically via trigger.

2. Changes
   - Backfill: set show_in_all_categories = true for all existing products
     that have a non-null category_id.
   - Trigger: before insert or update on products, if category_id is not null,
     set show_in_all_categories = true automatically.

3. Security
   No RLS changes. No new tables.
*/

UPDATE products
SET show_in_all_categories = true
WHERE category_id IS NOT NULL AND show_in_all_categories = false;

CREATE OR REPLACE FUNCTION auto_set_show_in_all()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    NEW.show_in_all_categories := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_show_in_all ON products;
CREATE TRIGGER trg_auto_show_in_all
  BEFORE INSERT OR UPDATE OF category_id ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_show_in_all();
