/*
  # Add Cooks Functionality

  1. New Tables
    - `cooks` table to store cook user information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamp)
      
  2. Changes
    - Update patients table RLS to allow cooks to view all patient reports
    - Add policies for cooks to view all patients
    
  3. Security
    - Enable RLS on cooks table
    - Cooks can only view their own profile
    - Cooks can view all patient records (read-only)
*/

-- Create cooks table
CREATE TABLE IF NOT EXISTS cooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_cooks_user_id ON cooks(user_id);

-- Enable RLS on cooks table
ALTER TABLE cooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for cooks table
CREATE POLICY "Cooks can view own profile"
  ON cooks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Cooks can insert own profile"
  ON cooks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Cooks can update own profile"
  ON cooks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Add RLS policy for cooks to view all patients
CREATE POLICY "Cooks can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cooks
      WHERE cooks.user_id = (select auth.uid())
    )
  );