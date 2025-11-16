# How to Check Logs for User Creation Issues

## Browser Console Logs

### Step 1: Open Browser Console
1. Go to your deployed site
2. Press **F12** (or right-click → Inspect)
3. Click on the **Console** tab
4. Clear the console (click the 🚫 icon or press Ctrl+L)

### Step 2: Try Creating an Account
1. Fill out the sign up form
2. Click "Create Account"
3. Watch the console for messages

### Step 3: What to Look For

#### ✅ Success Messages:
- `"handleSignUp called"`
- `"Form validation passed, starting sign up..."`
- `"Calling authService.signUp..."`
- `"Sign up successful, user:"`
- `"Initializing user in database:"`
- `"User init response status: 201"` (or 200)
- `"✅ User successfully initialized in database:"`

#### ❌ Error Messages:
- `"❌ Failed to initialize user in database:"`
- `"Failed to initialize user: 500"` (or other status codes)
- `"User initialization returned null"`
- `"DATABASE_URL is not set!"`
- Network errors (CORS, connection refused, etc.)

### Step 4: Copy the Logs
1. Right-click in the console
2. Select "Save as..." or copy all messages
3. Share the logs (especially errors)

## Netlify Function Logs

### Step 1: Access Netlify Dashboard
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign in
3. Select your site

### Step 2: View Function Logs
1. Click on **"Functions"** tab in your site dashboard
2. Find **"user-init"** in the list
3. Click on it
4. Click **"View logs"** or **"Logs"** tab

### Step 3: What to Look For

#### ✅ Success Messages:
- `"user-init function called"`
- `"Parsed data:"` (should show userId, email, name)
- `"Creating new user record in user_usage table"`
- `"Insert result:"` (should show the created user)
- `"Fetched new user:"` (should show user data)

#### ❌ Error Messages:
- `"DATABASE_URL is not set!"`
- `"Missing required fields:"`
- `"Error initializing user:"`
- Database connection errors
- SQL syntax errors
- Table not found errors

### Step 4: Filter Logs
1. Look for logs from the last few minutes (when you tried to sign up)
2. Filter by searching for "user-init" or "error"
3. Copy the relevant log entries

## Common Issues and What Logs Show

### Issue: DATABASE_URL Not Set
**Browser Console:**
- `"Failed to initialize user: 500 Database connection not configured"`

**Netlify Logs:**
- `"DATABASE_URL is not set!"`

**Fix:** Add DATABASE_URL to Netlify environment variables (see DATABASE_URL_SETUP.md)

### Issue: Function Not Being Called
**Browser Console:**
- No `"Initializing user in database:"` message
- No network request to `/user-init`

**Netlify Logs:**
- No `"user-init function called"` messages

**Fix:** Check if `initializeUser` is being called in AuthModal

### Issue: Network Error
**Browser Console:**
- `"Failed to fetch"` or CORS errors
- `"NetworkError"` or connection refused

**Netlify Logs:**
- No function invocation (request never reached function)

**Fix:** Check Netlify function deployment and CORS settings

### Issue: Database Table Missing
**Netlify Logs:**
- `"relation 'user_usage' does not exist"`
- `"table user_usage does not exist"`

**Fix:** Run the schema.sql script in Neon Console

### Issue: User Already Exists
**Netlify Logs:**
- `"User already exists, returning existing record"`

**Fix:** This is normal - user was already created. Check database directly.

### Issue: Invalid User Data
**Netlify Logs:**
- `"Missing required fields:"`
- `"User ID and email are required"`

**Fix:** Check that userId and email are being passed correctly

## Quick Diagnostic Checklist

After trying to create an account, check:

- [ ] Browser console shows `"handleSignUp called"`
- [ ] Browser console shows `"Initializing user in database:"`
- [ ] Browser console shows network request to `/user-init`
- [ ] Netlify logs show `"user-init function called"`
- [ ] Netlify logs show `"Parsed data:"` with userId and email
- [ ] Netlify logs show `"Creating new user record"`
- [ ] Netlify logs show `"Insert result:"` with user data
- [ ] No error messages in browser console
- [ ] No error messages in Netlify logs
- [ ] User appears in Neon database when querying `user_usage` table

## Share Logs for Help

When asking for help, include:
1. **Browser console logs** (especially errors)
2. **Netlify function logs** (especially errors)
3. **What you see** (account created? logged in? error message?)
4. **What you don't see** (user in database? function called?)

This will help identify exactly where the issue is occurring.

