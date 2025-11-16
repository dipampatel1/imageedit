# Netlify Environment Variables Setup for Supabase

## Required Environment Variables

You need to add **4 environment variables** in Netlify:

### 1. Server-Side Variables (for Netlify Functions)
These are used by your Netlify Functions to access Supabase.

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) | Supabase Dashboard → Settings → API → service_role key |

**⚠️ Important**: These do NOT have the `VITE_` prefix because they're used server-side.

### 2. Client-Side Variables (for React app)
These are used by your React application in the browser.

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Same as SUPABASE_URL above |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key (safe for client) | Supabase Dashboard → Settings → API → anon public key |

**Note**: These have the `VITE_` prefix because they're used client-side.

## Step-by-Step: Add Variables in Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site

2. **Navigate to Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Or: **Site configuration** → **Environment variables**

3. **Add Each Variable**
   Click **"Add a variable"** and add each one:

   **Variable 1:**
   - Key: `SUPABASE_URL`
   - Value: `https://xxxxx.supabase.co` (your Supabase project URL)
   - Scope: All scopes (or specific if needed)

   **Variable 2:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (your service_role key)
   - Scope: All scopes (or specific if needed)
   - ⚠️ **Important**: This is the **service_role** key, NOT the anon key!

   **Variable 3:**
   - Key: `VITE_SUPABASE_URL`
   - Value: Same as `SUPABASE_URL` above
   - Scope: All scopes

   **Variable 4:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (your anon/public key)
   - Scope: All scopes

4. **Save and Redeploy**
   - Click **"Save"** after adding all variables
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## How to Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Sign in and select your project

2. **Navigate to API Settings**
   - Click **Settings** (gear icon in sidebar)
   - Click **API** in the settings menu

3. **Copy the Values**
   - **Project URL**: Found under "Project URL" section
     - Example: `https://abcdefghijklmnop.supabase.co`
   - **anon public key**: Found under "Project API keys" → "anon" → "public"
     - Starts with `eyJ...`
   - **service_role key**: Found under "Project API keys" → "service_role" → "secret"
     - ⚠️ **WARNING**: This is a secret key! Never expose it in client-side code.
     - Starts with `eyJ...`

## Verification Checklist

After adding variables, verify:

- [ ] `SUPABASE_URL` is set (no VITE_ prefix)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (no VITE_ prefix)
- [ ] `VITE_SUPABASE_URL` is set (with VITE_ prefix)
- [ ] `VITE_SUPABASE_ANON_KEY` is set (with VITE_ prefix)
- [ ] Site has been redeployed after adding variables
- [ ] Check Netlify function logs - should see `hasUrl: true, hasServiceRoleKey: true`

## Common Mistakes

❌ **Wrong**: Using `VITE_SUPABASE_URL` in Netlify Functions
✅ **Correct**: Use `SUPABASE_URL` (without VITE_ prefix) in Netlify Functions

❌ **Wrong**: Using anon key as service_role key
✅ **Correct**: Use the service_role key (different from anon key)

❌ **Wrong**: Not redeploying after adding variables
✅ **Correct**: Always redeploy after adding/updating environment variables

## Testing

After setup, test by:

1. **Try signing up** a new user
2. **Check Netlify function logs**:
   - Go to **Functions** tab in Netlify
   - Click on `user-init` function
   - Check logs - should NOT see "Supabase configuration missing"
3. **Check Supabase database**:
   - Go to Supabase Dashboard → Table Editor
   - Check `user_usage` table - should see new user record

## Troubleshooting

### Error: "Supabase configuration missing"
- **Fix**: Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set (without VITE_ prefix)
- **Fix**: Redeploy your site after adding variables

### Error: "Invalid API key"
- **Fix**: Verify you're using the correct service_role key (not anon key)
- **Fix**: Make sure the key is copied completely (no truncation)

### Error: "Failed to create user record"
- **Fix**: Check that database tables exist (run schema.sql in Supabase SQL Editor)
- **Fix**: Check Netlify function logs for detailed error messages

