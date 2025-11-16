# Debugging User Creation in Neon Database

## Issue
Users are not being created in the `user_usage` table when they sign up.

## Debugging Steps

### 1. Check Browser Console
After signing up, open the browser console (F12) and look for:
- `"Initializing user in database:"` - confirms the function is being called
- `"User init response status:"` - shows the HTTP status code
- Any error messages

### 2. Check Netlify Function Logs
1. Go to Netlify Dashboard → Your Site → Functions
2. Click on `user-init` function
3. Check the logs for:
   - `"user-init function called"` - confirms function is invoked
   - `"Parsed data:"` - shows the data received
   - `"Creating new user record"` - confirms insert attempt
   - Any error messages

### 3. Verify Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, ensure:
- `DATABASE_URL` is set (required for all Netlify functions)
- Format: `postgresql://user:password@host/database?sslmode=require`

### 4. Test the Function Directly
You can test the function using curl or Postman:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/user-init \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","email":"test@example.com","name":"Test User"}'
```

### 5. Check Database Connection
Verify the DATABASE_URL is correct:
- Go to Neon Console → Your Project → Connection Details
- Copy the connection string
- Ensure it matches what's in Netlify environment variables

### 6. Verify Table Schema
Run this in Neon Console SQL Editor:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_usage';

-- Check table structure
\d user_usage

-- Check if user_level column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_usage';
```

### 7. Common Issues

#### Issue: DATABASE_URL not set
**Symptom:** Function returns 500 error, logs show "Database connection not configured"
**Fix:** Add `DATABASE_URL` to Netlify environment variables

#### Issue: Table doesn't exist
**Symptom:** Function returns error about table not found
**Fix:** Run the schema.sql script in Neon Console

#### Issue: user_level column missing
**Symptom:** Function fails with column error
**Fix:** Run the migration: `database/migration_add_user_level.sql`

#### Issue: Function not being called
**Symptom:** No logs in Netlify, no console messages
**Fix:** 
- Check if `initializeUser` is being called in AuthModal
- Verify `FUNCTIONS_URL` is correct
- Check browser network tab for failed requests

#### Issue: CORS errors
**Symptom:** Browser console shows CORS error
**Fix:** Function should handle CORS - check function code

### 8. Manual Test Query
Test inserting a user directly in Neon Console:

```sql
INSERT INTO user_usage (
  user_id, 
  email, 
  tier, 
  user_level, 
  images_generated, 
  current_period_start, 
  current_period_end
)
VALUES (
  'test-manual-123', 
  'test@example.com', 
  'free', 
  'user', 
  0, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP + INTERVAL '1 month'
);

-- Verify it was created
SELECT * FROM user_usage WHERE user_id = 'test-manual-123';
```

If this works, the issue is with the function. If this fails, the issue is with the database schema.

## About users_sync Table

The `users_sync` table is created by Neon Auth (Stack Auth) and stores authentication data. This is separate from `user_usage`:
- `users_sync`: Managed by Neon Auth, contains auth credentials
- `user_usage`: Managed by your app, contains subscription/usage data

Both tables are needed and serve different purposes.

