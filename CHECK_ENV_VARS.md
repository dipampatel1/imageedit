# How to Check Stack Auth Environment Variables

## Quick Check in Browser Console

After deploying, open your browser console (F12) and look for this message at the very top:

```
🔵 Stack Auth Environment Check:
  NEXT_PUBLIC_STACK_PROJECT_ID: SET or NOT SET
  VITE_STACK_PROJECT_ID: SET or NOT SET
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: SET or NOT SET
  VITE_STACK_PUBLISHABLE_CLIENT_KEY: SET or NOT SET
  Resolved projectId length: [number]
  Resolved publishableClientKey length: [number]
  Stack Auth configured: true or false
```

## What Each Message Means

### If you see "NOT SET":
- The environment variable is not in Netlify
- **Fix**: Add it to Netlify → Site settings → Environment variables

### If you see "SET" but length is 0:
- The environment variable exists but is empty
- **Fix**: Update the value in Netlify (don't leave it empty)

### If length > 0 but "Stack Auth configured: false":
- The values might be invalid or have wrong format
- **Fix**: Check that values are correct Stack Auth credentials

## Required Environment Variables in Netlify

You need these two variables (use either naming convention):

**Option 1 (Recommended):**
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`

**Option 2 (Also works):**
- `VITE_STACK_PROJECT_ID`
- `VITE_STACK_PUBLISHABLE_CLIENT_KEY`

## How to Get Stack Auth Credentials

1. **Provision Neon Auth** in Neon Console
2. **Get credentials** after provisioning:
   - Project ID (starts with `prj_`)
   - Publishable Client Key (starts with `pk_`)
   - Secret Server Key (starts with `sk_`) - for server-side only

3. **Add to Netlify**:
   - Go to Netlify → Site settings → Environment variables
   - Add `NEXT_PUBLIC_STACK_PROJECT_ID` = your Project ID
   - Add `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` = your Publishable Key
   - Add `STACK_SECRET_SERVER_KEY` = your Secret Key (for functions)

4. **Redeploy** after adding variables

## Troubleshooting

### Variables not showing in console?

1. **Check deployment**: Make sure latest code is deployed
2. **Clear cache**: Hard refresh (Ctrl+Shift+R)
3. **Check console filter**: Make sure "All levels" is selected
4. **Scroll up**: The logs appear when the page first loads

### Variables show "SET" but length is 0?

- The variable exists but has no value
- **Fix**: Update the variable in Netlify with the actual credential value
- Make sure you're not using placeholder text like "your_project_id_here"

### Still not working?

1. Check Netlify build logs for errors
2. Verify variable names are exactly correct (case-sensitive)
3. Make sure you redeployed after adding variables
4. Check that values don't have extra spaces or quotes

