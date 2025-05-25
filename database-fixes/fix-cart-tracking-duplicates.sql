-- Fix cart tracking duplicate key constraint issues
-- Run this in Supabase SQL Editor to clean up any existing duplicate records

-- First, let's see if there are any duplicate user_id records
SELECT user_id, COUNT(*) as count
FROM cart_tracking 
WHERE user_id IS NOT NULL
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Delete duplicate cart tracking records, keeping only the most recent one for each user_id
WITH ranked_records AS (
  SELECT id, user_id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM cart_tracking 
  WHERE user_id IS NOT NULL
)
DELETE FROM cart_tracking 
WHERE id IN (
  SELECT id FROM ranked_records WHERE rn > 1
);

-- Also clean up any orphaned guest records that might conflict
-- (This removes guest records where the guest_token is null but user_id is also null)
DELETE FROM cart_tracking 
WHERE user_id IS NULL AND guest_token IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as user_records,
  COUNT(CASE WHEN guest_token IS NOT NULL THEN 1 END) as guest_records
FROM cart_tracking;

-- Show any remaining potential issues
SELECT user_id, COUNT(*) as count
FROM cart_tracking 
WHERE user_id IS NOT NULL
GROUP BY user_id 
HAVING COUNT(*) > 1;
