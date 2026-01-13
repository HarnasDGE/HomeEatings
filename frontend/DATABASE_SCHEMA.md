# 🍴 Database Schema for Products and Meals

## SQL Migrations to Execute in Supabase

Execute these SQL commands in **Supabase Dashboard > SQL Editor**.

### 1. Products Table

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'g', 'ml', 'szt', 'kg', etc.
  calories DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX products_user_id_idx ON products(user_id);
CREATE INDEX products_name_idx ON products(name);
```

### 2. Meals Table

```sql
-- Create meals table
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  calories DECIMAL(10, 2) DEFAULT 0,
  protein DECIMAL(10, 2) DEFAULT 0,
  carbs DECIMAL(10, 2) DEFAULT 0,
  fats DECIMAL(10, 2) DEFAULT 0,
  cooking_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  preparation_steps TEXT[], -- array of steps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can view their own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
  ON meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
  ON meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
  ON meals FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX meals_user_id_idx ON meals(user_id);
CREATE INDEX meals_meal_type_idx ON meals(meal_type);
CREATE INDEX meals_name_idx ON meals(name);
```

### 3. Meal Products Junction Table (Many-to-Many)

```sql
-- Create meal_products junction table
CREATE TABLE meal_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL, -- amount in product's unit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meal_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE meal_products ENABLE ROW LEVEL SECURITY;

-- Policies for meal_products (users can manage products for their own meals)
CREATE POLICY "Users can view products in their own meals"
  ON meal_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_products.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products to their own meals"
  ON meal_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_products.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products in their own meals"
  ON meal_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_products.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products from their own meals"
  ON meal_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_products.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Indexes for faster joins
CREATE INDEX meal_products_meal_id_idx ON meal_products(meal_id);
CREATE INDEX meal_products_product_id_idx ON meal_products(product_id);
```

### 4. Storage Bucket for Meal Images

```sql
-- Create storage bucket for meal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true);

-- Storage policies for meal images
CREATE POLICY "Users can upload meal images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = 'meals'
  );

CREATE POLICY "Anyone can view meal images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'meal-images');

CREATE POLICY "Users can update their own meal images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = 'meals'
  );

CREATE POLICY "Users can delete their own meal images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'meal-images' AND
    (storage.foldername(name))[1] = 'meals'
  );
```

### 5. Useful Views (Optional but Recommended)

```sql
-- View for meals with product details
CREATE OR REPLACE VIEW meal_details AS
SELECT
  m.id,
  m.user_id,
  m.name,
  m.description,
  m.image_url,
  m.meal_type,
  m.calories,
  m.protein,
  m.carbs,
  m.fats,
  m.cooking_time,
  m.servings,
  m.preparation_steps,
  m.created_at,
  m.updated_at,
  json_agg(
    json_build_object(
      'product_id', p.id,
      'product_name', p.name,
      'quantity', mp.quantity,
      'unit', p.unit,
      'calories', p.calories
    ) ORDER BY p.name
  ) FILTER (WHERE p.id IS NOT NULL) AS products
FROM meals m
LEFT JOIN meal_products mp ON m.id = mp.meal_id
LEFT JOIN products p ON mp.product_id = p.id
GROUP BY m.id;
```

### 6. Triggers for Updated_at

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for meals
CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Quick Setup Steps

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Create a new query
3. Copy and paste **all sections above**
4. Click **Run** (or run section by section)
5. Go to **Storage** and verify `meal-images` bucket was created

## Verification

After running the migrations, verify:

```sql
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'meals', 'meal_products');

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'meals', 'meal_products');

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'meal-images';
```

## Data Model Summary

```
Users (auth.users)
  │
  ├─── Products (1:many)
  │     - id, name, unit, calories
  │
  └─── Meals (1:many)
        - id, name, description, image_url
        - meal_type, calories, macros
        - cooking_time, servings, steps
        │
        └─── Meal_Products (many:many with Products)
              - meal_id, product_id, quantity
```

## Notes

- All tables have Row Level Security enabled
- Users can only access their own data
- Meal images are stored in Supabase Storage
- The `meal_details` view provides a convenient way to fetch meals with their products
- Automatic `updated_at` timestamp updates via triggers
