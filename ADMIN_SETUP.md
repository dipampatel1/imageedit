# Admin User Setup Guide

## Overview

The application now supports user levels: `user` (default) and `admin`. Admin users have access to an admin panel with a direct link to the Neon Console for database management.

## Database Migration

If you have an existing database, run the migration script to add the `user_level` column:

```sql
-- Run this in your Neon Console SQL Editor
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS user_level VARCHAR(50) NOT NULL DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_user_usage_user_level ON user_usage(user_level);
```

Or use the migration file: `database/migration_add_user_level.sql`

## Setting a User as Admin

### Method 1: Via Neon Console SQL Editor

1. Go to your Neon Console: https://console.neon.tech
2. Navigate to your project
3. Open the SQL Editor
4. Run this query (replace with actual email or user_id):

```sql
-- By email
UPDATE user_usage 
SET user_level = 'admin' 
WHERE email = 'admin@example.com';

-- By user_id
UPDATE user_usage 
SET user_level = 'admin' 
WHERE user_id = 'your-user-id-here';
```

### Method 2: Via Neon Console UI

1. Go to Neon Console
2. Navigate to your project → Database → Tables
3. Find the `user_usage` table
4. Click on a user row to edit
5. Change `user_level` from `user` to `admin`
6. Save changes

## Verifying Admin Status

Check if a user is admin:

```sql
SELECT user_id, email, user_level, tier 
FROM user_usage 
WHERE user_level = 'admin';
```

## Admin Features

Once a user is set as admin:

1. **Admin Badge**: A purple "Admin" badge appears next to their profile
2. **Admin Panel Button**: A settings/gear icon button appears in the header
3. **Neon Console Link**: Clicking the admin panel opens a modal with:
   - Direct link to Neon Console for database management
   - Quick SQL query examples
   - Information about admin capabilities

## Neon Project ID

To enable the direct link to Neon Console, set the environment variable:

**Netlify Environment Variable:**
- `VITE_NEON_PROJECT_ID` - Your Neon project ID

You can find your project ID in the Neon Console URL:
- URL format: `https://console.neon.tech/app/projects/{project_id}`
- The project ID is the part after `/projects/`

## Admin Capabilities

Admins can use the Neon Console to:

- View and manage all users
- Update subscription tiers
- Promote/demote users to/from admin
- Run SQL queries
- Monitor database performance
- View usage statistics
- Manage image history

## Security Notes

- Only users with `user_level = 'admin'` in the database can access the admin panel
- The admin panel is client-side only - actual database access requires Neon Console login
- Consider implementing additional server-side admin checks for sensitive operations
- Regularly audit admin users in your database

## Removing Admin Access

To remove admin access from a user:

```sql
UPDATE user_usage 
SET user_level = 'user' 
WHERE email = 'user@example.com';
```

