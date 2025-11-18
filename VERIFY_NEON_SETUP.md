# Verify Neon Database Setup

## ✅ Database Connection (Done)

You've successfully connected your Neon database via Netlify Dashboard. Netlify should have automatically set:
- `NETLIFY_DATABASE_URL` - Automatically configured by Netlify

## Next Steps

### 1. Verify Environment Variable

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Verify that `NETLIFY_DATABASE_URL` is listed (it should be automatically set)
4. You should also see `DATABASE_URL` if you set it manually before

### 2. Redeploy Your Site

After connecting the database, trigger a new deployment:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for the deployment to complete

### 3. Verify Database Tables Exist

Make sure your database has the required tables:

1. Go to your Neon Console
2. Navigate to your project → SQL Editor
3. Run this query to check tables:

```sql
-- Check if user_usage table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_usage';

-- Check if image_history table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'image_history';

-- Check if neon_auth schema exists (for Neon Auth)
SELECT * FROM information_schema.schemata 
WHERE schema_name = 'neon_auth';
```

If tables are missing, run the schema from `database/schema.sql` in the Neon SQL Editor.

### 4. Test Database Connection

After redeploying, test a function:

1. Try creating a new user account
2. Check Netlify Function logs:
   - Go to **Functions** tab in Netlify
   - Click on a function (e.g., `user-init`)
   - Check the logs for any database connection errors

### 5. Verify Neon Auth Setup (Important!)

For users to be created in `neon_auth` schema (not `public` schema), you need to:

1. **Provision Neon Auth** in your Neon project:
   - Go to Neon Console → Your Project
   - Look for "Neon Auth" or "Authentication" section
   - Click "Provision Neon Auth" or "Set up authentication"
   - This creates the `neon_auth` schema and `users_sync` table

2. **Get Stack Auth Credentials** (after provisioning):
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY` (for server-side)

3. **Add Stack Auth credentials to Netlify**:
   - Go to Netlify → Site settings → Environment variables
   - Add the three credentials above
   - Redeploy after adding

## Expected Behavior

### ✅ With Neon Auth Provisioned:
- Users sign up → Created in `neon_auth.users_sync` table
- User usage data → Stored in `public.user_usage` table
- Images → Stored in `public.image_history` table

### ❌ Without Neon Auth:
- Users sign up → Created in `public` schema (localStorage fallback)
- This is what you're currently experiencing

## Troubleshooting

### Database Connection Errors

If you see "Database connection not configured" errors:

1. **Check environment variables**:
   - Ensure `NETLIFY_DATABASE_URL` exists in Netlify
   - Check that it's not empty

2. **Verify connection string format**:
   - Should start with `postgresql://`
   - Should include `?sslmode=require`

3. **Test connection**:
   - Try running a simple query in Neon SQL Editor
   - Verify the connection string works

### Users Still in Public Schema

If users are still being created in `public` schema:

1. **Check if Neon Auth is provisioned**:
   ```sql
   SELECT * FROM information_schema.schemata 
   WHERE schema_name = 'neon_auth';
   ```
   - If empty, Neon Auth is not provisioned

2. **Check Stack Auth credentials**:
   - Verify `NEXT_PUBLIC_STACK_PROJECT_ID` is set
   - Verify `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` is set
   - Check browser console for Stack Auth errors

3. **Verify StackProvider is wrapping app**:
   - Check `index.tsx` has `<StackProvider>`
   - Check `AuthModal.tsx` uses `<SignUp />` and `<SignIn />` components

## Quick Test

After setup, test the flow:

1. **Sign up a new user**:
   - Go to your app
   - Click "Sign Up"
   - Create a new account

2. **Check database**:
   ```sql
   -- Check neon_auth (if Neon Auth is provisioned)
   SELECT * FROM neon_auth.users_sync ORDER BY created_at DESC LIMIT 1;
   
   -- Check user_usage
   SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 1;
   ```

3. **Check Netlify Function logs**:
   - Functions → `user-init` → View logs
   - Should see successful database operations

## Summary

✅ **Database Connection**: Connected via Netlify Dashboard  
⏳ **Neon Auth**: Needs to be provisioned (if not done yet)  
⏳ **Stack Auth Credentials**: Need to be added to Netlify (if not done yet)  
⏳ **Redeploy**: Trigger new deployment after setup

