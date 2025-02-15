/*
  # Add thumbnail performance tracking

  1. New Columns
    - Added to `thumbnails` table:
      - `impressions` (integer) - Number of times thumbnail was viewed
      - `clicks` (integer) - Number of times thumbnail was clicked
      - `ctr` (decimal) - Click-through rate

  2. Changes
    - Added default values for new metrics columns
    - Added computed column for CTR

  3. Security
    - Updated RLS policies to allow updating performance metrics
*/

-- Add performance metrics columns
ALTER TABLE thumbnails 
ADD COLUMN IF NOT EXISTS impressions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ctr decimal GENERATED ALWAYS AS (
  CASE 
    WHEN impressions > 0 THEN (clicks::decimal / impressions::decimal) * 100
    ELSE 0
  END
) STORED;

-- Add policy for updating performance metrics
CREATE POLICY "Users can update thumbnail metrics"
  ON thumbnails
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    (
      OLD.impressions IS DISTINCT FROM NEW.impressions OR
      OLD.clicks IS DISTINCT FROM NEW.clicks
    )
  );