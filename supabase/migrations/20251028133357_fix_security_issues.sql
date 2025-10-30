/*
  # Fix Security Issues

  1. Performance Improvements
    - Add index on patients.user_id foreign key for better query performance
    - Optimize RLS policies to use (select auth.uid()) instead of auth.uid()
    
  2. Security
    - Optimized RLS policies prevent re-evaluation on each row
    - Maintains same security constraints with better performance
*/

-- Add index on user_id foreign key for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert own patients" ON patients;
DROP POLICY IF EXISTS "Users can update own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete own patients" ON patients;

-- Recreate RLS policies with optimized auth.uid() calls
CREATE POLICY "Users can view own patients"
  ON patients FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own patients"
  ON patients FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);