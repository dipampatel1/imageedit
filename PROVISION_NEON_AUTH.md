# How to Provision Neon Auth and Fix "Users in Public Schema" Issue

## Problem

Users are being created in the `public` schema instead of the `neon_auth` schema. This happens when Neon Auth (Stack Auth) is not properly configured.

## Solution: Provision Neon Auth

### Step 1: Provision Neon Auth in Neon Console

1. **Go to Neon Console**
   - Visit https://console.neon.tech
   - Sign in and select your project

2. **Navigate to Neon Auth**
   - Look for "Neon Auth" or "Authentication" in the left sidebar
   - OR go to your project → Settings → Integrations
   - OR look for a "Provision Neon Auth" button

3. **Provision Neon Auth**
   - Click "Provision Neon Auth" or "Set up authentication"
   - Follow the setup wizard
   - This will:
     - Create the `neon_auth` schema
     - Create the `users_sync` table
     - Set up Stack Auth integration

4. **Get Your Credentials**
   After provisioning, you'll receive:
   - **Project ID**: Something like `prj_xxxxx`
   - **Publishable Client Key**: Something like `pk_xxxxx`
   - **Secret Server Key**: Something like `sk_xxxxx` (keep this secret!)

### Step 2: Add Credentials to Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Select your site

2. **Navigate to Environment Variables**
   - Go to **Site settings** → **Environment variables**

3. **Add Stack Auth Credentials**
   Add these three variables:

   **Variable 1: NEXT_PUBLIC_STACK_PROJECT_ID**
   - Key: `NEXT_PUBLIC_STACK_PROJECT_ID`
   - Value: Your Project ID from Neon (e.g., `prj_xxxxx`)
   - Scope: All scopes

   **Variable 2: NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY**
   - Key: `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - Value: Your Publishable Client Key from Neon (e.g., `pk_xxxxx`)
   - Scope: All scopes

   **Variable 3: STACK_SECRET_SERVER_KEY**
   - Key: `STACK_SECRET_SERVER_KEY`
   - Value: Your Secret Server Key from Neon (e.g., `sk_xxxxx`)
   - Scope: All scopes (or Functions only for security)

   **Alternative Names (also supported):**
   - `VITE_STACK_PROJECT_ID` (instead of `NEXT_PUBLIC_STACK_PROJECT_ID`)
   - `VITE_STACK_PUBLISHABLE_CLIENT_KEY` (instead of `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`)

### Step 3: Redeploy Your Site

1. **Trigger New Deployment**
   - Go to **Deploys** tab in Netlify
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Wait for deployment to complete

### Step 4: Verify Setup

1. **Check Browser Console**
   - Open your app
   - Open browser DevTools (F12)
   - Check Console tab
   - You should **NOT** see: `⚠️ Stack Auth credentials are missing!`

2. **Test Sign Up**
   - Create a new user account
   - Check Neon Console → SQL Editor:
     ```sql
     -- Check neon_auth schema
     SELECT * FROM neon_auth.users_sync ORDER BY created_at DESC LIMIT 1;
     
     -- Check public schema (should be empty for new users)
     SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 1;
     ```

3. **Verify User Location**
   - New users should appear in `neon_auth.users_sync`
   - User usage data should appear in `public.user_usage`
   - Users should **NOT** be created directly in `public` schema

## Troubleshooting

### Still Seeing "Users in Public Schema"

1. **Check Environment Variables**
   - Go to Netlify → Site settings → Environment variables
   - Verify all three Stack Auth credentials are set
   - Check that values are not empty

2. **Check Browser Console**
   - Look for: `⚠️ Stack Auth credentials are missing!`
   - If you see this, credentials are not being loaded

3. **Verify Variable Names**
   - Use `NEXT_PUBLIC_STACK_PROJECT_ID` (or `VITE_STACK_PROJECT_ID`)
   - Use `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (or `VITE_STACK_PUBLISHABLE_CLIENT_KEY`)
   - Case-sensitive!

4. **Check Neon Auth Provisioning**
   - Go to Neon Console
   - Verify `neon_auth` schema exists:
     ```sql
     SELECT * FROM information_schema.schemata 
     WHERE schema_name = 'neon_auth';
     ```
   - If empty, Neon Auth is not provisioned

5. **Check Netlify Function Logs**
   - Go to Netlify → Functions → `user-init`
   - Check for errors related to Stack Auth

### Error: "Stack Auth credentials are missing"

**Cause**: Environment variables are not set or not accessible.

**Fix**:
1. Add credentials to Netlify environment variables
2. Redeploy your site
3. Clear browser cache and reload

### Error: "Neon Auth not provisioned"

**Cause**: Neon Auth hasn't been set up in Neon Console.

**Fix**:
1. Go to Neon Console
2. Provision Neon Auth (see Step 1 above)
3. Get credentials and add to Netlify

### Users Still Created in Public Schema

**Possible Causes**:
1. Stack Auth credentials are empty or incorrect
2. StackProvider is not wrapping the app (check `index.tsx`)
3. AuthModal is not using Stack Auth components (check `components/AuthModal.tsx`)

**Fix**:
1. Verify credentials in Netlify
2. Check browser console for errors
3. Verify StackProvider is in `index.tsx`
4. Verify AuthModal uses `<SignUp />` and `<SignIn />` components

## Quick Checklist

- [ ] Neon Auth provisioned in Neon Console
- [ ] `NEXT_PUBLIC_STACK_PROJECT_ID` set in Netlify
- [ ] `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` set in Netlify
- [ ] `STACK_SECRET_SERVER_KEY` set in Netlify
- [ ] Site redeployed after adding variables
- [ ] Browser console shows no "credentials missing" warning
- [ ] New users appear in `neon_auth.users_sync` table

## Expected Behavior After Setup

✅ **With Neon Auth Configured**:
- Users sign up → Created in `neon_auth.users_sync`
- User usage → Stored in `public.user_usage`
- Images → Stored in `public.image_history`

❌ **Without Neon Auth** (Current State):
- Users sign up → Created in `public` schema (localStorage fallback)
- This is what you're experiencing now

## Need Help?

If you're still having issues:

1. **Check Neon Console**:
   - Verify Neon Auth is provisioned
   - Check if `neon_auth` schema exists

2. **Check Netlify**:
   - Verify environment variables are set
   - Check function logs for errors

3. **Check Browser Console**:
   - Look for Stack Auth errors
   - Check if credentials are being loaded

4. **Verify Code**:
   - `index.tsx` should have `<StackProvider>`
   - `components/AuthModal.tsx` should use `<SignUp />` and `<SignIn />`

