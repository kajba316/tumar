/*
# Fix product publication default

1. Modified Tables
   - `products`: change `is_published` default from `true` to `false`
   - New products created via admin will always start as unpublished
2. Notes
   - Existing products keep their current `is_published` values
   - Only the default for NEW inserts changes
*/

ALTER TABLE products ALTER COLUMN is_published SET DEFAULT false;
