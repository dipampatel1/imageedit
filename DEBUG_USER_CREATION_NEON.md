# Debugging User Creation in Neon

If users are not being created in Neon, follow these steps to diagnose the issue.

## Step 1: Check Browser Console Logs

After attempting to sign up, check your browser console (F12 → Console tab) for:

1. **Sign-up flow logs:**
   - `🔵 Calling authService.signUp...`
   - `✅ Sign up successful, user:`
   - `User signed up, attempting to initialize in database:`
   - `Using userId:` or `Generated userId from email:`
   - `Initializing user in database:`
   - `Calling: /.netlify/functions/user-init`

2. **Error messages:**
   - Look for `❌` (red X) emoji markers
   - Check for any error messages about database initialization

## Step 2: Check Netlify Function Logs

1. **Go to Netlify Dashboard:**
   - Visit https://app.netlify.com
   - Select your site
   - Go to **Functions** tab
   - Click on **`user-init`**
   - Click on **Logs** tab

2. **Look for these log entries:**
   - `user-init function called`
   - `Event body:` (should show the request data)
   - `Parsed data:` (should show userId, email, name)
   - `Neon client initialized successfully` ✅
   - `Checking if user exists:`
   - `Creating new user record in user_usage table`
   - `Inserting user with data:`
   - `Insert result:`
   - `Extracted newUser:`

3. **Common errors to look for:**
   - `DATABASE_URL is not set in environment variables` ❌
   - `Neon client not available - DATABASE_URL is missing` ❌
   - `Error initializing user:` followed by error details
   - Database connection errors
   - SQL syntax errors

## Step 3: Verify Environment Variables

1. **Check Netlify Environment Variables:**
   - Go to Netlify Dashboard → Site settings → Environment variables
   - Verify `DATABASE_URL` is set
   - The value should be your Neon connection string:
     ```
     postgresql://user:password@host/database?sslmode=require
     ```

2. **Verify the Connection String:**
   - Should start with `postgresql://`
   - Should contain username, password, host, and database name
   - Should end with `?sslmode=require`
   - Should NOT have `VITE_` prefix (server-side variable)

3. **Redeploy After Changes:**
   - If you just added/updated `DATABASE_URL`, you MUST redeploy:
     - Go to **Deploys** tab
     - Click **Trigger deploy** → **Clear cache and deploy site**

## Step 4: Check Database Schema

1. **Verify Tables Exist:**
   - Go to Neon Console → SQL Editor
   - Run: `SELECT * FROM user_usage LIMIT 1;`
   - If you get an error, the table doesn't exist - run `database/schema.sql`

2. **Verify Column Names:**
   - Run: `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_usage';`
   - Should see: `user_id`, `email`, `tier`, `user_level`, `images_generated`, etc.

## Step 5: Test Database Connection

1. **Test from Neon Console:**
   - Go to Neon Console → SQL Editor
   - Try inserting a test record:
     ```sql
     INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
     VALUES ('test-user-123', 'test@example.com', 'free', 'user', 0, NOW(), NOW() + INTERVAL '1 month')
     RETURNING *;
     ```
   - If this works, the database is fine - issue is with Netlify Functions

## Step 6: Common Issues and Fixes

### Issue: "DATABASE_URL is not set"
**Fix:**
- Add `DATABASE_URL` in Netlify environment variables
- Make sure it's exactly `DATABASE_URL` (case-sensitive, no spaces)
- Redeploy after adding

### Issue: "Connection refused" or "Connection timeout"
**Fix:**
- Verify the connection string is complete
- Check if Neon project is paused (Neon pauses inactive projects)
- Make sure `?sslmode=require` is at the end
- Try getting a fresh connection string from Neon Console

### Issue: "Table doesn't exist"
**Fix:**
- Run `database/schema.sql` in Neon SQL Editor
- Verify you're connected to the correct database

### Issue: "Column doesn't exist"
**Fix:**
- Check the schema matches `database/schema.sql`
- Column names should be: `user_id`, `email`, `tier`, `user_level`, etc.

### Issue: Function returns 500 but no clear error
**Fix:**
- Check Netlify function logs for the full error stack trace
- Look for SQL syntax errors or constraint violations
- Verify all required columns are being provided

## Step 7: Share Debug Information

If the issue persists, share:

1. **Browser Console Logs:**
   - Copy all console output from sign-up attempt
   - Look for lines with 🔵, ✅, ❌, ⚠️ emojis

2. **Netlify Function Logs:**
   - Copy the full log output from `user-init` function
   - Include any error messages

3. **Environment Variable Status:**
   - Confirm `DATABASE_URL` is set (don't share the value!)
   - Confirm when it was last updated

4. **Database Status:**
   - Confirm tables exist
   - Confirm you can query the database from Neon Console

## Quick Test

After fixing issues, test by:

1. **Clear browser localStorage:**
   - Open console (F12)
   - Run: `localStorage.clear()`
   - Refresh page

2. **Try signing up with a new email**

3. **Check both:**
   - Browser console for client-side logs
   - Netlify function logs for server-side logs
   - Neon database for the new user record

