# Troubleshooting "Invalid authentication credentials" Error

If you're seeing `"Invalid authentication credentials"` when trying to create users, this guide will help you fix it.

## The Problem

The error means your Supabase API key is either:
1. **Incorrect** - Wrong key value
2. **Wrong type** - Using anon key instead of service_role key
3. **Missing permissions** - Key doesn't have admin access
4. **Wrong format** - Key is malformed or incomplete

## For Self-Hosted Supabase (Coolify)

### Step 1: Find the Correct Key

In self-hosted Supabase, you typically need the **service_role key** (not the anon key) for server-side operations.

**Where to find it:**

1. **Coolify Dashboard**:
   - Go to your Supabase service
   - Check **Environment Variables**
   - Look for:
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SERVICE_ROLE_KEY`
     - `SUPABASE_KEY` (might be the service role key)

2. **Supabase Studio**:
   - Access your Supabase Studio (usually at `http://your-supabase-url/studio`)
   - Go to **Settings** → **API**
   - Look for **service_role** key (under "Project API keys")

3. **Database Query** (if you have access):
   ```sql
   -- Check for service role key in config
   SELECT * FROM auth.config;
   ```

### Step 2: Verify Key Type

**Service Role Key** (what you need):
- Has **admin privileges**
- Bypasses Row Level Security (RLS)
- Usually longer than anon key
- Starts with `eyJ...` (JWT token)

**Anon Key** (what you DON'T want for server-side):
- Has limited permissions
- Respects RLS policies
- Also starts with `eyJ...` but different value

### Step 3: Update Netlify Environment Variables

Make sure you're using the **service_role key** (not anon key) for server-side:

1. **In Netlify** → **Environment Variables**:
   - `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` = **service_role key** (not anon key)
   - `VITE_SUPABASE_ANON_KEY` = **anon key** (for client-side)

2. **Important**: 
   - Server-side functions need the **service_role key**
   - Client-side React app can use the **anon key**

### Step 4: Check Key Format

The key should:
- Start with `eyJ` (JWT token format)
- Be a long string (usually 200+ characters)
- Not have any spaces or line breaks
- Be the complete key (not truncated)

### Step 5: Test the Key

You can test if your key works by making a direct API call:

```bash
# Replace with your values
curl -X GET 'http://your-supabase-url/rest/v1/user_usage?select=*' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

If you get an authentication error, the key is wrong.

## Common Solutions

### Solution 1: Use Service Role Key Instead of Anon Key

**Problem**: Using anon key for server-side operations

**Fix**: 
- Get the service_role key from Coolify/Supabase
- Update `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in Netlify
- Redeploy

### Solution 2: Check Key Permissions

**Problem**: Key exists but doesn't have admin permissions

**Fix**:
- In Supabase, ensure the key has service_role permissions
- For self-hosted, check your Supabase configuration
- You may need to regenerate the key

### Solution 3: Verify Key is Complete

**Problem**: Key was truncated when copying

**Fix**:
- Copy the entire key (it's long!)
- Make sure there are no spaces
- Paste it carefully into Netlify

### Solution 4: Check Supabase URL

**Problem**: Wrong Supabase URL

**Fix**:
- Verify `SUPABASE_URL` matches your actual Supabase instance
- For self-hosted: `http://supabasekong-xxxxx.xx.xx.xx.xx.sslip.io`
- Make sure it's accessible from the internet

## Quick Diagnostic Checklist

After updating your key, check the Netlify function logs:

✅ **Good signs**:
- No "Invalid authentication credentials" error
- User record created successfully
- `Insert result:` shows user data (not null)

❌ **Bad signs**:
- "Invalid authentication credentials" error
- `Insert result: null`
- `Insert error:` shows authentication error

## Still Not Working?

1. **Check Netlify logs** for the key prefix (first 20 chars) - verify it matches your key
2. **Try using the anon key** temporarily to see if it's a permissions issue
3. **Check Supabase logs** in Coolify for any errors
4. **Verify your Supabase instance** is running and accessible
5. **Test with a simple query** using the key directly

## Alternative: Use Anon Key with RLS Disabled

If you can't get the service_role key to work, you can:

1. **Disable RLS** on your tables (not recommended for production):
   ```sql
   ALTER TABLE user_usage DISABLE ROW LEVEL SECURITY;
   ALTER TABLE image_history DISABLE ROW LEVEL SECURITY;
   ```

2. **Use anon key** for both client and server (less secure)

⚠️ **Warning**: This reduces security. Only do this for testing.

