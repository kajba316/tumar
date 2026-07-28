/*
# Add RLS policy for popular_products view
   - Allow anon and authenticated to read the view
   - The view uses security_invoker so it inherits products table RLS
   - This explicit policy ensures access works correctly
*/

ALTER VIEW popular_products OWNER TO postgres;

GRANT SELECT ON popular_products TO anon, authenticated;
