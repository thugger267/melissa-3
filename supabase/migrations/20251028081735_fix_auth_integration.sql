/*
  # Fix Supabase Auth Integration

  1. Changes
    - Drop custom users table
    - Update patients table to reference auth.users directly
    - Update RLS policies to use auth.uid() properly
    
  2. Security
    - Maintain RLS on patients table
    - Update policies to work with Supabase Auth
*/

-- Drop the custom users table and its policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP TABLE IF EXISTS users CASCADE;

-- Update patients table to remove user_id foreign key constraint if it exists
-- and recreate it to reference auth.users
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;

-- Ensure user_id column exists and is uuid type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE patients ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Add foreign key reference to auth.users
ALTER TABLE patients 
  ADD CONSTRAINT patients_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Recreate RLS policies for patients table
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;

CREATE POLICY "Users can view own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own patients"
  ON patients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);