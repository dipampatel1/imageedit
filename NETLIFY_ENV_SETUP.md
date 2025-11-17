# Netlify Environment Variables Setup for Neon

## Required Environment Variables

You need to add the following environment variables in Netlify:

### Server-Side Variables (for Netlify Functions)
These are used by your Netlify Functions to access the Neon database.

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | Neon Console → Connection Details → Connection String |

**⚠️ Important**: This does NOT have the `VITE_` prefix because it's used server-side.

### Client-Side Variables (for React app)
These are used by your React application in the browser.

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Google AI Studio |
| `VITE_NEON_PROJECT_ID` | Your Neon project ID (optional, for admin panel) | Neon Console → Project Settings |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Stripe Dashboard |
| `VITE_STRIPE_*_PRICE_ID` | Your Stripe Price IDs | Stripe Dashboard → Products |

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

   **Variable 1: DATABASE_URL (Required)**
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@host/database?sslmode=require` (your Neon connection string)
   - Scope: All scopes (or Builds and Functions)
   - ⚠️ **Important**: Get this from Neon Console → Connection Details

   **Variable 2: VITE_GEMINI_API_KEY (Required)**
   - Key: `VITE_GEMINI_API_KEY`
   - Value: Your Google Gemini API key
   - Scope: All scopes

   **Variable 3: VITE_NEON_PROJECT_ID (Optional)**
   - Key: `VITE_NEON_PROJECT_ID`
   - Value: Your Neon project ID (for admin panel link)
   - Scope: All scopes

   **Variable 4-9: Stripe Variables (Required for payments)**
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_STRIPE_STARTER_MONTHLY_PRICE_ID`
   - `VITE_STRIPE_STARTER_ANNUAL_PRICE_ID`
   - `VITE_STRIPE_PRO_MONTHLY_PRICE_ID`
   - `VITE_STRIPE_PRO_ANNUAL_PRICE_ID`
   - `VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID`
   - `VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID`

4. **Save and Redeploy**
   - Click **"Save"** after adding all variables
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## How to Get Your Neon Connection String

1. **Go to Neon Console**
   - Visit https://console.neon.tech
   - Sign in and select your project

2. **Get Connection String**
   - Click on your project
   - Go to **Connection Details** or **Settings** → **Connection**
   - Copy the **Connection String** (URI format)
   - It should look like: `postgresql://user:password@ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require`

3. **Verify the Connection String**
   - ✅ Starts with `postgresql://`
   - ✅ Contains username and password
   - ✅ Contains the host (e.g., `ep-xxxx-xxxx.region.aws.neon.tech`)
   - ✅ Contains the database name (usually `neondb`)
   - ✅ Ends with `?sslmode=require`

## Verification Checklist

After adding variables, verify:

- [ ] `DATABASE_URL` is set (no VITE_ prefix)
- [ ] `VITE_GEMINI_API_KEY` is set (with VITE_ prefix)
- [ ] `VITE_NEON_PROJECT_ID` is set (optional, for admin panel)
- [ ] All Stripe variables are set (if using payments)
- [ ] Site has been redeployed after adding variables
- [ ] Check Netlify function logs - should NOT see "DATABASE_URL is not set"

## Common Mistakes

❌ **Wrong**: Using `VITE_DATABASE_URL` in Netlify Functions
✅ **Correct**: Use `DATABASE_URL` (without VITE_ prefix) in Netlify Functions

❌ **Wrong**: Not redeploying after adding variables
✅ **Correct**: Always redeploy after adding/updating environment variables

❌ **Wrong**: Using incomplete connection string
✅ **Correct**: Use the full connection string including `?sslmode=require`

## Testing

After setup, test by:

1. **Try signing up** a new user
2. **Check Netlify function logs**:
   - Go to **Functions** tab in Netlify
   - Click on `user-init` function
   - Check logs - should NOT see "DATABASE_URL is not set"
3. **Check Neon database**:
   - Go to Neon Console → SQL Editor
   - Run: `SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 5;`
   - Should see new user record

## Troubleshooting

### Error: "DATABASE_URL is not set"
- **Fix**: Make sure `DATABASE_URL` is set (without VITE_ prefix)
- **Fix**: Redeploy your site after adding variables

### Error: "Connection refused" or "Connection timeout"
- **Fix**: Verify the connection string is complete and correct
- **Fix**: Make sure `?sslmode=require` is at the end
- **Fix**: Check if your Neon project is paused (Neon pauses inactive projects)

### Error: "Table doesn't exist"
- **Fix**: Run the schema.sql script in Neon SQL Editor
- **Fix**: Make sure you're connected to the correct database

### Error: "Authentication failed"
- **Fix**: The password in the connection string might be incorrect
- **Fix**: Get a fresh connection string from Neon Console
