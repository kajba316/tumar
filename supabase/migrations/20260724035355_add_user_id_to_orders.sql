/*
# Add user_id to orders for customer accounts

1. Changes
- Add `user_id` column (uuid, nullable) to `orders` table. Links an order to a registered customer.
- Add a SELECT policy for authenticated users to read their own orders.
- Add an INSERT policy for authenticated users to create their own orders (with DEFAULT auth.uid()).
2. Security
- The new `user_id` column is nullable so existing guest orders are preserved.
- New policies scope SELECT and INSERT to the owner via auth.uid().
- Existing anon policies remain intact so guest checkout still works.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

-- Allow authenticated users to read their own orders
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own orders
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
