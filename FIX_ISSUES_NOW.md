# Fix These Two Issues Now

## Issue 1: Invalid API Key (CRITICAL - Fix This First)

**Error:** `"Invalid API key. For self-hosted Supabase, ensure you're using the service_role key"`

### Step-by-Step Fix:

1. **Go to Coolify Dashboard**
   - Open your Supabase service
   - Go to **Environment Variables** or **Env** tab

2. **Find the Service Role Key**
   - Look for: `SUPABASE_SERVICE_ROLE_KEY` or `SERVICE_ROLE_KEY`
   - Or check Supabase Studio → Settings → API → service_role key
   - This is DIFFERENT from the anon key!

3. **Update Netlify**
   - Go to Netlify → Your Site → Environment Variables
   - Find `SUPABASE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
   - Replace the value with the **service_role key** from Coolify
   - Click **Save**

4. **Redeploy**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

5. **Verify**
   - After deploy, check Netlify function logs
   - Look for: `Supabase config:` log
   - Should show `keyLength: 200+` (if key is correct)

---

## Issue 2: Mixed Content (HTTPS → HTTP)

**Error:** `"Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'"`

### Quick Fix Options:

#### Option A: Use HTTPS for Supabase (Best)

1. **In Coolify:**
   - Go to your Supabase service
   - Enable **HTTPS/SSL**
   - Coolify can auto-setup Let's Encrypt

2. **Get HTTPS URL:**
   - Should be: `https://supabasekong-...` (instead of `http://`)

3. **Update Netlify Environment Variables:**
   - `VITE_SUPABASE_URL` = `https://supabasekong-...` (change http to https)
   - `SUPABASE_URL` = `https://supabasekong-...` (change http to https)
   - Redeploy

#### Option B: Test if HTTPS Already Works

Try accessing: `https://supabasekong-i4kggsg4cwo0w4kk4ogss44k.31.97.13.33.sslip.io`

- If it works → Use `https://` in environment variables
- If it doesn't → Need to set up HTTPS in Coolify

#### Option C: Temporary Workaround (For Testing)

For now, the app will:
- ✅ Work with localStorage fallback (sign-up works)
- ❌ Won't use Supabase Auth (client-side blocked)
- ❌ Database initialization fails (API key issue)

**Fix the API key first**, then set up HTTPS.

---

## Priority Order

1. **FIRST**: Fix API key (Issue 1) - This will make database functions work
2. **SECOND**: Set up HTTPS (Issue 2) - This will enable Supabase Auth

---

## After Fixing

1. **Test Sign-Up Again**
2. **Check Netlify Function Logs:**
   - Should see: `Supabase config:` with correct key length
   - Should NOT see: "Invalid API key" error
3. **Check Browser Console:**
   - Should NOT see: "Mixed Content" error (if HTTPS is set up)
   - Should see: Successful user creation

---

## Need Help Finding the Service Role Key?

1. **In Coolify:**
   - Supabase service → Environment Variables
   - Look for keys with "service" or "role" in the name

2. **In Supabase Studio:**
   - Access: `http://your-supabase-url/studio`
   - Settings → API
   - Find "service_role" key (under "Project API keys")

3. **If you only have one key:**
   - It might be the service_role key
   - Try using it for both `SUPABASE_KEY` and `VITE_SUPABASE_ANON_KEY`
   - (Less secure, but might work for testing)

