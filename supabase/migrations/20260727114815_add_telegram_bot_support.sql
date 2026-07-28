/*
# Add Telegram bot support

1. Purpose
- Link existing site accounts (site_users) to Telegram users via a telegram_id column.
- Provide a server-side cart for Telegram users, since the storefront cart is
  localStorage-only and has no server table. This is the minimal new table required
  for the Telegram bot's cart/order flow to work.

2. Changes to existing tables
- `site_users`: add `telegram_id` (bigint, nullable, unique). A site user can be
  linked to exactly one Telegram account. Nullable so existing rows are unaffected.

3. New tables
- `telegram_cart`: server-side cart keyed by telegram_id (and optionally site_user_id
  once the account is linked). Each row is one product line in one Telegram user's cart.
  - id (uuid pk)
  - telegram_id (bigint, not null) — the Telegram user who owns this cart line
  - site_user_id (uuid, nullable, references site_users) — set after account linking
  - product_id (uuid, nullable, references products) — denormalized for safety
  - product_name (text, not null) — snapshot at add time
  - product_price (numeric, not null) — snapshot at add time
  - quantity (integer, not null, default 1)
  - created_at (timestamptz, default now())

4. Security (RLS)
- Enable RLS on telegram_cart.
- The table is written and read by the telegram-bot edge function using the
  service role key (which bypasses RLS), so no anon/authenticated policies are
  needed. RLS stays enabled and locked; the service role handles all access.
- No policies added on site_users for telegram_id (the edge function uses the
  service role key to read/update it).

5. Important notes
- No data is lost: telegram_id is nullable, telegram_cart is a brand-new table.
- The storefront cart (localStorage) is untouched and continues to work as before.
- The Telegram bot reads products/categories/orders/site_settings/branches from
  existing tables using the service role key.
*/

ALTER TABLE site_users
  ADD COLUMN IF NOT EXISTS telegram_id bigint;

-- Unique constraint so one Telegram account links to one site account
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'site_users_telegram_id_key'
  ) THEN
    ALTER TABLE site_users ADD CONSTRAINT site_users_telegram_id_key UNIQUE (telegram_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS telegram_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL,
  site_user_id uuid REFERENCES site_users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE telegram_cart ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_telegram_cart_telegram_id ON telegram_cart(telegram_id);
