-- Migration: Add user_level column to user_usage table
-- Run this migration to add admin/user level support

ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS user_level VARCHAR(50) NOT NULL DEFAULT 'user';

-- Add comment to document the column
COMMENT ON COLUMN user_usage.user_level IS 'User access level: ''user'' or ''admin''';

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_level ON user_usage(user_level);

-- Example: Set a specific user as admin (replace with actual user_id or email)
-- UPDATE user_usage SET user_level = 'admin' WHERE email = 'admin@example.com';

