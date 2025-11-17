# Fix Mixed Content Error (HTTPS → HTTP)

## The Problem

Your Netlify site is HTTPS (`https://imageedit3720.netlify.app`) but your Supabase is HTTP (`http://supabasekong-...`). Browsers block HTTP requests from HTTPS pages for security (Mixed Content).

## Solutions

### Solution 1: Use HTTPS for Supabase (Recommended)

If your Coolify/Supabase instance supports HTTPS:

1. **Set up HTTPS in Coolify:**
   - Go to Coolify dashboard
   - Your Supabase service → Settings
   - Enable HTTPS/SSL
   - Coolify can set up Let's Encrypt automatically

2. **Update Netlify Environment Variables:**
   - Change `VITE_SUPABASE_URL` from `http://` to `https://`
   - Change `SUPABASE_URL` from `http://` to `https://`
   - Redeploy

### Solution 2: Use Netlify Proxy (If HTTPS not available)

If you can't use HTTPS for Supabase, we can proxy requests through Netlify Functions.

**This requires code changes** - let me know if you want this approach.

### Solution 3: Configure Supabase CORS (Temporary workaround)

For self-hosted Supabase, you might be able to configure it to allow requests, but this doesn't solve the Mixed Content issue.

## Quick Fix: Check if HTTPS is Available

1. **Try accessing your Supabase with HTTPS:**
   - Try: `https://supabasekong-i4kggsg4cwo0w4kk4ogss44k.31.97.13.33.sslip.io`
   - If it works, use that URL instead

2. **Check Coolify:**
   - Go to your Supabase service in Coolify
   - Look for SSL/HTTPS settings
   - Enable it if available

## For Now: Fix the API Key Issue

Even with Mixed Content, the server-side functions should work. The main issue is the **Invalid API key**.

1. **Check Netlify Environment Variables:**
   - `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` should be the **service_role key**
   - Not the anon key!

2. **Get the correct key from Coolify:**
   - Go to Coolify → Supabase service
   - Check environment variables
   - Look for `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`
   - Or check Supabase Studio → Settings → API → service_role key

3. **Update in Netlify:**
   - Replace `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` with the correct service_role key
   - Redeploy

## Priority

1. **First**: Fix the API key (this will make server-side functions work)
2. **Second**: Set up HTTPS for Supabase (this will fix client-side auth)

Let me know which solution you prefer!

