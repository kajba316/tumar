/*
# Add show_in_all_categories flag to products

1. Modified Tables
- `products`: add `show_in_all_categories` boolean column (default false).
  When true, the product appears in every category in the catalog.
  When false, the product only appears in its assigned category (category_id).

2. Security
- No RLS policy changes. The column is readable through the existing
  public SELECT policy on products.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS show_in_all_categories boolean NOT NULL DEFAULT false;
