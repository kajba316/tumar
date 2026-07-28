/*
# Add account features: email, balance, login history, balance transactions

## Overview
This migration enhances the site_users table with email and balance columns,
and creates two new tables for tracking login history and balance transactions.
These support the redesigned personal account dashboard.

## Changes to site_users table
1. `email` (text, unique, nullable) — user's email address, required for new registrations
2. `balance` (numeric, default 0) — user's account balance for top-ups

## New Tables

### login_history
Tracks every login event for security auditing.
- `id` (uuid, primary key)
- `user_id` (uuid, FK to site_users.id, ON DELETE CASCADE)
- `ip_address` (text, nullable) — IP address of the login request
- `user_agent` (text, nullable) — browser/device user agent
- `created_at` (timestamptz, default now())

### balance_transactions
Tracks all balance top-ups and debits.
- `id` (uuid, primary key)
- `user_id` (uuid, FK to site_users.id, ON DELETE CASCADE)
- `amount` (numeric, not null) — positive for top-up, negative for debit
- `type` (text, not null) — 'topup' or 'purchase'
- `description` (text, nullable)
- `order_id` (uuid, nullable, FK to orders.id) — links to order if purchase
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both new tables.
- login_history: users can only read their own login history.
- balance_transactions: users can only read their own transactions.
- All writes go through the service role (edge functions), so no INSERT/UPDATE/DELETE policies for authenticated users.
*/

-- Add email and balance to site_users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_users' AND column_name = 'email') THEN
    ALTER TABLE site_users ADD COLUMN email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_users' AND column_name = 'balance') THEN
    ALTER TABLE site_users ADD COLUMN balance numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create unique index on email (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS site_users_email_unique ON site_users (email) WHERE email IS NOT NULL;

-- Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES site_users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_login_history" ON login_history;
CREATE POLICY "select_own_login_history"
  ON login_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create balance_transactions table
CREATE TABLE IF NOT EXISTS balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES site_users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('topup', 'purchase')),
  description text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_balance_transactions" ON balance_transactions;
CREATE POLICY "select_own_balance_transactions"
  ON balance_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions (user_id, created_at DESC);
