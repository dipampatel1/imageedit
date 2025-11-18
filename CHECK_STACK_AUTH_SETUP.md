# Quick Check: Is Stack Auth Configured?

## Step 1: Check Browser Console

1. Open your app in the browser
2. Open DevTools (F12)
3. Go to Console tab
4. Look for these messages:

### ✅ If Stack Auth IS Configured:
```
🔵 AuthModal - Stack Auth Configuration Check:
  Project ID: prj_xxxxx...
  Publishable Key: pk_xxxxx...
  Stack App available: true
✅ Stack Auth is configured. Users should be created in neon_auth schema.
```

### ❌ If Stack Auth is NOT Configured:
```
⚠️ Stack Auth credentials are missing!
⚠️ Users will be created in public schema instead of neon_auth schema.
🔵 AuthModal - Stack Auth Configuration Check:
  Project ID: ❌ MISSING
  Publishable Key: ❌ MISSING
❌ Stack Auth is NOT configured! Users will be created in public schema.
```

## Step 2: Check Netlify Environment Variables

1. Go to Netlify Dashboard → Your Site
2. Site settings → Environment variables
3. Check if these exist:
   - `NEXT_PUBLIC_STACK_PROJECT_ID` (or `VITE_STACK_PROJECT_ID`)
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (or `VITE_STACK_PUBLISHABLE_CLIENT_KEY`)
   - `STACK_SECRET_SERVER_KEY`

### If Missing:
- You need to provision Neon Auth first (see `PROVISION_NEON_AUTH.md`)
- Then add the credentials to Netlify
- Redeploy your site

## Step 3: Check Neon Console

1. Go to Neon Console → Your Project
2. Check if `neon_auth` schema exists:
   ```sql
   SELECT * FROM information_schema.schemata 
   WHERE schema_name = 'neon_auth';
   ```

### If Empty:
- Neon Auth is not provisioned
- Follow `PROVISION_NEON_AUTH.md` to provision it

## Step 4: Test Sign Up

1. Try to sign up a new user
2. Check what happens:

### If Stack Auth is Configured:
- Sign up form should work normally
- User should be created in `neon_auth.users_sync` table
- Check Neon Console:
  ```sql
  SELECT * FROM neon_auth.users_sync ORDER BY created_at DESC LIMIT 1;
  ```

### If Stack Auth is NOT Configured:
- You'll see a warning message in the sign-up form
- Sign up will be disabled
- Message: "⚠️ Neon Auth Not Configured"

## Common Issues

### Issue 1: Credentials Set But Still Not Working

**Check:**
1. Are variable names correct? (case-sensitive)
2. Did you redeploy after adding variables?
3. Are values not empty?

**Fix:**
- Double-check variable names in Netlify
- Trigger a new deployment
- Verify values are not empty strings

### Issue 2: Credentials Set But Users Still in Public Schema

**Possible Causes:**
1. Stack Auth not provisioned in Neon
2. Credentials are incorrect
3. Browser cache issue

**Fix:**
1. Verify Neon Auth is provisioned
2. Check credentials are correct
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 3: "Stack App available: false"

**Cause:** StackProvider is not wrapping the app correctly

**Fix:**
- Check `index.tsx` has `<StackProvider>` with credentials
- Verify credentials are not empty strings
- Check browser console for Stack Auth initialization errors

## Quick Fix Checklist

- [ ] Check browser console for Stack Auth status
- [ ] Verify environment variables in Netlify
- [ ] Check if Neon Auth is provisioned in Neon Console
- [ ] Redeploy site after adding credentials
- [ ] Clear browser cache
- [ ] Test sign up and check `neon_auth.users_sync` table

## Still Not Working?

1. **Check Netlify Function Logs:**
   - Go to Functions → `user-init` → View logs
   - Look for Stack Auth related errors

2. **Check Neon Database:**
   - Verify `neon_auth` schema exists
   - Check if `users_sync` table exists

3. **Verify Code:**
   - `index.tsx` should have `<StackProvider>` with credentials
   - `components/AuthModal.tsx` should use `<SignUp />` and `<SignIn />`

4. **Contact Support:**
   - Share browser console logs
   - Share Netlify function logs
   - Share Neon Console screenshot

