/*
  # POS System Database Schema for Garments Business

  ## Overview
  This migration creates the complete database structure for a Point of Sale system
  designed for garments/clothing retail businesses.

  ## New Tables

  ### 1. `products`
  Stores inventory and product information
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `sku` (text, unique) - Stock Keeping Unit code
  - `category` (text) - Product category (shirts, pants, etc.)
  - `size` (text) - Size information
  - `color` (text) - Color variant
  - `purchase_price` (decimal) - Cost price per unit
  - `selling_price` (decimal) - Retail price per unit
  - `stock_quantity` (integer) - Current stock level
  - `low_stock_threshold` (integer) - Alert threshold for low stock
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `sales`
  Records all sales transactions
  - `id` (uuid, primary key) - Unique sale identifier
  - `sale_date` (timestamptz) - Transaction timestamp
  - `total_amount` (decimal) - Total sale amount
  - `total_cost` (decimal) - Total cost of goods sold
  - `profit` (decimal) - Calculated profit (total_amount - total_cost)
  - `customer_phone` (text) - Customer phone number
  - `invoice_url` (text) - Link to generated invoice
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `sale_items`
  Individual items within each sale transaction
  - `id` (uuid, primary key) - Unique item identifier
  - `sale_id` (uuid, foreign key) - Reference to parent sale
  - `product_id` (uuid, foreign key) - Reference to product
  - `product_name` (text) - Product name snapshot
  - `quantity` (integer) - Quantity sold
  - `unit_price` (decimal) - Selling price per unit
  - `unit_cost` (decimal) - Cost price per unit
  - `subtotal` (decimal) - Total for this line item
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Authenticated users can perform all operations
  - No public access without authentication

  ## Indexes
  - Created indexes on foreign keys for better query performance
  - Index on sale_date for analytics queries
  - Index on stock_quantity for inventory monitoring

  ## Notes
  - All monetary values use numeric(10,2) for precision
  - Timestamps use timestamptz for timezone awareness
  - Foreign keys include ON DELETE CASCADE for data integrity
  - Low stock threshold defaults to 10 units
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text DEFAULT '',
  size text DEFAULT '',
  color text DEFAULT '',
  purchase_price numeric(10,2) NOT NULL,
  selling_price numeric(10,2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date timestamptz DEFAULT now(),
  total_amount numeric(10,2) NOT NULL,
  total_cost numeric(10,2) NOT NULL,
  profit numeric(10,2) NOT NULL,
  customer_phone text DEFAULT '',
  invoice_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  unit_cost numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sales table
CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sale_items table
CREATE POLICY "Authenticated users can view sale items"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sale items"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sale items"
  ON sale_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sale items"
  ON sale_items FOR DELETE
  TO authenticated
  USING (true);