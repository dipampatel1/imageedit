# Self-Hosted Supabase Setup Guide (Coolify)

This guide is for users running Supabase on Coolify or other self-hosted platforms.

## Finding Your API Keys

In a self-hosted Supabase instance, you need to find your API keys. Here's where to look:

### Option 1: Coolify Dashboard

1. **Go to your Coolify dashboard**
2. **Navigate to your Supabase service**
3. **Check Environment Variables**:
   - Look for variables like `SUPABASE_ANON_KEY` or `ANON_KEY`
   - Look for `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`
   - Or a generic `SUPABASE_KEY` that might work for both

### Option 2: Supabase Studio (Web UI)

1. **Access Supabase Studio**:
   - Usually at: `http://your-supabase-url/studio` or similar
   - Or check your Coolify service URL

2. **Go to Settings → API**:
   - Look for "Project API keys"
   - You should see:
     - **anon/public key**: For client-side use
     - **service_role key**: For server-side use (admin access)

### Option 3: Database Query

If you have database access, you can query the keys:

```sql
-- Check for API keys in the database
SELECT * FROM auth.config;
```

### Option 4: Coolify Environment Variables

1. **In Coolify**, go to your Supabase service
2. **Click on "Environment Variables"** or "Env" tab
3. **Look for**:
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANON_KEY`
   - `SERVICE_ROLE_KEY`
   - `SUPABASE_KEY` (might be a generic key)

## Environment Variables for Netlify

Based on your self-hosted setup, add these to Netlify:

### Required Variables:

1. **`SUPABASE_URL`**
   - Value: `http://supabasekong-i4kggsg4cwo0w4kk4ogss44k.31.97.13.33.sslip.io`
   - Or your custom Supabase URL

2. **`SUPABASE_SERVICE_ROLE_KEY`** (or `SUPABASE_KEY`)
   - Value: Your service role key from Coolify/Supabase
   - This is the key with admin privileges for server-side operations

### Client-Side Variables (with VITE_ prefix):

3. **`VITE_SUPABASE_URL`**
   - Value: Same as `SUPABASE_URL` above

4. **`VITE_SUPABASE_ANON_KEY`** (or use the same key if you only have one)
   - Value: Your anon/public key from Coolify/Supabase
   - If you only have one key, you can use the same value for both

## Important Notes for Self-Hosted

### 1. HTTP vs HTTPS
- Your URL uses `http://` instead of `https://`
- This is fine for self-hosted, but make sure:
  - Your Netlify site can access it (CORS might be an issue)
  - Consider using HTTPS if possible (Coolify can set up Let's Encrypt)

### 2. CORS Configuration
You may need to configure CORS in your Supabase instance to allow requests from your Netlify domain:

1. **In Supabase Studio** → **Settings** → **API**
2. **Add your Netlify domain** to allowed origins:
   - Example: `https://your-site.netlify.app`
   - Or: `https://your-custom-domain.com`

### 3. Single Key vs Multiple Keys
- **If you have separate keys**: Use `SUPABASE_SERVICE_ROLE_KEY` for server-side and `VITE_SUPABASE_ANON_KEY` for client-side
- **If you only have one key**: You can use the same key for both, but it's less secure

## Quick Setup Checklist

- [ ] Found your Supabase URL (you have this: `http://supabasekong-...`)
- [ ] Found your API key(s) from Coolify/Supabase Studio
- [ ] Added `SUPABASE_URL` to Netlify environment variables
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_KEY`) to Netlify
- [ ] Added `VITE_SUPABASE_URL` to Netlify
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Netlify (or use same key)
- [ ] Configured CORS in Supabase to allow your Netlify domain
- [ ] Redeployed Netlify site
- [ ] Tested user sign-up

## Testing

After setup, test by:

1. **Try signing up** a new user
2. **Check Netlify function logs**:
   - Should NOT see "Supabase configuration missing"
   - Should see successful database operations
3. **Check your Supabase database**:
   - Connect to your database
   - Query `user_usage` table - should see new user records

## Troubleshooting

### Error: "Supabase configuration missing"
- **Fix**: Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_KEY`) are set in Netlify
- **Fix**: Redeploy after adding variables

### Error: "CORS policy" or network errors
- **Fix**: Add your Netlify domain to Supabase CORS settings
- **Fix**: Check that your Supabase URL is accessible from the internet

### Error: "Invalid API key"
- **Fix**: Verify you're using the correct key from your Coolify/Supabase instance
- **Fix**: Make sure the key is copied completely (no truncation)

### Error: "Connection refused" or timeout
- **Fix**: Verify your Supabase URL is correct and accessible
- **Fix**: Check if your self-hosted Supabase is running and accessible from the internet
- **Fix**: Consider using HTTPS if possible

## Alternative: Using SUPABASE_KEY

If your self-hosted Supabase only provides a single `SUPABASE_KEY`, you can use it for both:

1. Set `SUPABASE_KEY` in Netlify (for server-side functions)
2. Set `VITE_SUPABASE_ANON_KEY` to the same value (for client-side)

The code has been updated to support `SUPABASE_KEY` as a fallback for `SUPABASE_SERVICE_ROLE_KEY`.

