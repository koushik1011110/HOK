/*
  # Update RLS Policies for Public Access

  This migration updates the Row Level Security policies to allow
  public (unauthenticated) users to read and write to products, sales,
  and sale_items tables. This is necessary for the POS system to
  function without requiring user authentication.

  Security Note: In a production environment with real authentication,
  these policies should be replaced with authenticated user policies.
*/

DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

DROP POLICY IF EXISTS "Authenticated users can view sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON sales;

DROP POLICY IF EXISTS "Authenticated users can view sale items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated users can insert sale items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated users can update sale items" ON sale_items;
DROP POLICY IF EXISTS "Authenticated users can delete sale items" ON sale_items;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sales"
  ON sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sales"
  ON sales FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view sale items"
  ON sale_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert sale items"
  ON sale_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sale items"
  ON sale_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete sale items"
  ON sale_items FOR DELETE
  USING (true);