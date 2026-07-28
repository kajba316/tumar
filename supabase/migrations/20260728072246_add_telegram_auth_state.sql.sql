/*
# Add telegram_auth_state table for in-bot login flow

## Overview
Stores temporary state for the Telegram bot's in-bot login flow.
When a user starts the login process in the bot, we store their progress
(waiting for login, waiting for password) so the stateless edge function
can track the multi-step conversation.

## New Table: telegram_auth_state
- `id` (uuid, primary key)
- `telegram_id` (bigint, unique) — the Telegram chat ID
- `step` (text) — current step: 'awaiting_login' or 'awaiting_password'
- `login_or_email` (text, nullable) — stored login/email while waiting for password
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Security
- RLS enabled. No authenticated policies needed — all access via service role in edge function.
*/

CREATE TABLE IF NOT EXISTS telegram_auth_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  step text NOT NULL DEFAULT 'awaiting_login',
  login_or_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE telegram_auth_state ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_tg_auth_state_telegram_id ON telegram_auth_state (telegram_id);
