# Deployment Checklist - Fix "Users in Public Schema"

## Problem
Users are still being created in the `public` schema instead of `neon_auth` schema, and there are no console logs showing.

## Likely Causes

1. **Code changes not deployed yet** - Most likely!
2. **Browser cache** - Old code is cached
3. **Stack Auth not configured** - Credentials missing

## Step-by-Step Fix

### Step 1: Verify Code Changes Are Committed

1. **Check if changes are committed**:
   ```bash
   git status
   ```

2. **If there are uncommitted changes, commit them**:
   ```bash
   git add .
   git commit -m "Add Stack Auth configuration checks and prevent public schema user creation"
   git push
   ```

### Step 2: Deploy to Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site

2. **Trigger New Deployment**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Wait for deployment to complete (usually 2-5 minutes)

3. **Verify Deployment**
   - Check that the latest commit is deployed
   - Look for your commit message in the deploy log

### Step 3: Clear Browser Cache

1. **Hard Refresh**:
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Or Clear Cache**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

### Step 4: Check Console Logs

1. **Open your app** in the browser
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Open the Sign Up modal**
5. **Look for these logs**:

   **Expected logs (if Stack Auth NOT configured):**
   ```
   ⚠️ Stack Auth credentials are missing!
   🔵 AuthModal - Stack Auth Configuration Check:
     Project ID: ❌ MISSING
     Publishable Key: ❌ MISSING
   ❌ Stack Auth is NOT configured! Users will be created in public schema.
   ```

   **Expected logs (if Stack Auth IS configured):**
   ```
   🔵 AuthModal - Stack Auth Configuration Check:
     Project ID: prj_xxxxx...
     Publishable Key: pk_xxxxx...
   ✅ Stack Auth is configured. Users should be created in neon_auth schema.
   ```

### Step 5: Check Sign Up Form

1. **Open Sign Up form**
2. **Check what you see**:

   **If Stack Auth NOT configured:**
   - You'll see a yellow warning box
   - Sign up form will be disabled
   - Message: "⚠️ Neon Auth Not Configured"

   **If Stack Auth IS configured:**
   - You'll see the normal Stack Auth sign-up form
   - No warning messages

### Step 6: Verify Stack Auth Credentials

1. **Go to Netlify** → Site settings → Environment variables
2. **Check if these exist**:
   - `NEXT_PUBLIC_STACK_PROJECT_ID` (or `VITE_STACK_PROJECT_ID`)
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (or `VITE_STACK_PUBLISHABLE_CLIENT_KEY`)

3. **If missing:**
   - Follow `PROVISION_NEON_AUTH.md` to provision Neon Auth
   - Add credentials to Netlify
   - Redeploy

### Step 7: Test After Deployment

1. **Try to sign up** a new user
2. **Check browser console** for logs
3. **Check Netlify Function logs**:
   - Go to Functions → `user-init` → View logs
   - Look for: `⚠️ WARNING: User ID appears to be from localStorage`
4. **Check Neon database**:
   ```sql
   -- Check neon_auth (should have users if Stack Auth is configured)
   SELECT * FROM neon_auth.users_sync ORDER BY created_at DESC LIMIT 1;
   
   -- Check public.user_usage (should only have usage data, not auth users)
   SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 1;
   ```

## Troubleshooting

### No Console Logs Appearing

**Possible causes:**
1. Code not deployed - Check Netlify deploy status
2. Browser cache - Clear cache and hard refresh
3. Wrong URL - Make sure you're on the deployed site, not localhost

**Fix:**
1. Verify deployment completed successfully
2. Clear browser cache
3. Check you're on the correct URL (Netlify URL, not localhost)

### Still Seeing Users in Public Schema

**If Stack Auth is configured:**
1. Check browser console for Stack Auth errors
2. Check Netlify function logs for errors
3. Verify credentials are correct in Netlify

**If Stack Auth is NOT configured:**
1. This is expected behavior
2. Follow `PROVISION_NEON_AUTH.md` to set up Neon Auth
3. Add credentials to Netlify
4. Redeploy

### Sign Up Form Shows Warning

**This is correct!** The warning means:
- Stack Auth is not configured
- Sign up is disabled to prevent creating users in public schema
- You need to provision Neon Auth first

## Quick Verification

After deployment, you should see:

✅ **Console logs** when opening auth modal  
✅ **Warning message** in sign-up form if Stack Auth not configured  
✅ **Sign-up disabled** if Stack Auth not configured  
✅ **Function logs** showing warnings if localStorage user IDs detected

If you don't see these, the code hasn't been deployed yet.

## Next Steps

1. **Commit and push** your code changes
2. **Deploy to Netlify** (with cache clear)
3. **Clear browser cache**
4. **Check console logs**
5. **If Stack Auth not configured**, follow `PROVISION_NEON_AUTH.md`

