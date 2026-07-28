-- Add payment status and card info to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_last4 text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_expiry text;

-- Allow public to read payment_status (needed for order tracking)
-- Orders are currently insert-only for public; admin uses service role
