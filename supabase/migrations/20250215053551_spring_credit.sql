/*
  # Create thumbnails table

  1. New Tables
    - `thumbnails`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `image_url` (text)
      - `prompt` (text)
      - `status` (enum: pending, completed, failed)

  2. Security
    - Enable RLS on `thumbnails` table
    - Add policies for authenticated users to:
      - Read their own thumbnails
      - Create new thumbnails
      - Update their own thumbnails
*/

-- Create enum type for thumbnail status
CREATE TYPE thumbnail_status AS ENUM ('pending', 'completed', 'failed');

-- Create thumbnails table
CREATE TABLE IF NOT EXISTS thumbnails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  image_url text,
  prompt text NOT NULL,
  status thumbnail_status DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own thumbnails"
  ON thumbnails
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create thumbnails"
  ON thumbnails
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thumbnails"
  ON thumbnails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);