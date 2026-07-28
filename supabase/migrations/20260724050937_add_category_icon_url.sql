/*
# Add icon_url column to categories

1. Modified Tables
   - `categories`: added `icon_url` (text, nullable) for category icon image
2. Notes
   - This allows categories to have both a large image (image_url) and a smaller icon (icon_url)
   - Both are optional; the frontend falls back to showing the first letter of the category name
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url text;
