# Step-by-Step: Get Neon DATABASE_URL and Configure in Netlify

## Part 1: Get DATABASE_URL from Neon Console

### Step 1: Log in to Neon Console
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign in with your Neon account

### Step 2: Select Your Project
1. You'll see a list of your projects
2. Click on the project you want to use (the one with your `user_usage` table)

### Step 3: Get Connection String
1. In your project dashboard, look for **"Connection Details"** or **"Connection String"** section
2. You'll see several connection options. Look for **"Connection string"** or **"URI"**
3. Click on the **"Copy"** button next to the connection string

**The connection string will look like this:**
```
postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Alternative Method: From Connection Settings
1. In your Neon project, click on **"Connection Details"** or **"Settings"** → **"Connection"**
2. You'll see different connection methods:
   - **URI** - This is what you need (starts with `postgresql://`)
   - **Parameters** - Shows individual parts (host, database, user, password)
3. Click **"Copy"** next to the URI/Connection String

### Step 4: Verify the Connection String
Make sure your connection string:
- ✅ Starts with `postgresql://`
- ✅ Contains your username
- ✅ Contains your password (or `[YOUR-PASSWORD]` placeholder)
- ✅ Contains the host (e.g., `ep-xxxx-xxxx.us-east-2.aws.neon.tech`)
- ✅ Contains the database name (usually `neondb` or `postgres`)
- ✅ Ends with `?sslmode=require` or `?sslmode=require&sslmode=require`

**Important:** If you see `[YOUR-PASSWORD]` in the connection string, you need to replace it with your actual database password.

## Part 2: Configure DATABASE_URL in Netlify

### Step 1: Log in to Netlify
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign in with your Netlify account

### Step 2: Select Your Site
1. From your dashboard, click on your site (the one where you're deploying the imageedit app)

### Step 3: Navigate to Environment Variables
1. In your site dashboard, click on **"Site settings"** (in the top navigation)
2. Scroll down in the left sidebar and click on **"Environment variables"**
3. You'll see a list of existing environment variables (if any)

### Step 4: Add DATABASE_URL
1. Click the **"Add a variable"** button (usually at the top right)
2. In the **"Key"** field, type exactly: `DATABASE_URL`
   - ⚠️ **Important:** Must be exactly `DATABASE_URL` (case-sensitive, no spaces)
3. In the **"Value"** field, paste your Neon connection string
   - Paste the full connection string you copied from Neon
   - Example: `postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Scope:** Leave as **"All scopes"** (or select "Builds and Functions" if you prefer)
5. Click **"Save"** or **"Add variable"**

### Step 5: Verify the Variable
1. You should now see `DATABASE_URL` in your environment variables list
2. The value will be hidden (shown as dots) for security
3. You can click on it to edit or delete if needed

### Step 6: Redeploy Your Site
**This is critical!** Environment variables are only available after redeployment.

1. Go to the **"Deploys"** tab in your Netlify dashboard
2. Click on **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for the deployment to complete (usually 1-3 minutes)

## Part 3: Verify It's Working

### Step 1: Test the Function
After redeployment, try signing up a new user:

1. Go to your deployed site
2. Click "Sign Up"
3. Create a test account
4. Open browser console (F12) and check for logs
5. Check Netlify function logs (see below)

### Step 2: Check Netlify Function Logs
1. In Netlify Dashboard → Your Site → **"Functions"** tab
2. Click on **"user-init"** function
3. Click on **"Logs"** or **"View logs"**
4. Look for:
   - ✅ `"user-init function called"` - Function is being invoked
   - ✅ `"Parsed data:"` - Shows the data received
   - ✅ `"Creating new user record"` - Database insert attempted
   - ❌ If you see `"DATABASE_URL is not set!"` - The variable wasn't set correctly

### Step 3: Check Database
1. Go back to Neon Console
2. Click on **"SQL Editor"** in your project
3. Run this query:
   ```sql
   SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 5;
   ```
4. You should see the newly created user

## Troubleshooting

### Issue: "DATABASE_URL is not set!" in logs
**Solution:**
- Double-check the variable name is exactly `DATABASE_URL` (case-sensitive)
- Make sure you redeployed after adding the variable
- Check that the variable scope includes "Functions"

### Issue: Connection refused or timeout
**Solution:**
- Verify the connection string is complete and correct
- Make sure `?sslmode=require` is at the end
- Check if your Neon project is paused (Neon pauses inactive projects)
- Verify your Neon project is active

### Issue: Authentication failed
**Solution:**
- The password in the connection string might be incorrect
- Get a fresh connection string from Neon Console
- Make sure you're using the connection string, not individual parameters

### Issue: Table doesn't exist
**Solution:**
- Run the schema.sql script in Neon Console SQL Editor
- Make sure you're connected to the correct database

### Issue: Variable not showing in function
**Solution:**
- Environment variables are only available in Netlify Functions, not in the browser
- Make sure you redeployed after adding the variable
- Check the variable scope includes "Functions"

## Quick Reference

**Neon Connection String Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Netlify Environment Variable:**
- **Key:** `DATABASE_URL`
- **Value:** Your full Neon connection string
- **Scope:** All scopes (or Builds and Functions)

**After Adding:**
1. ✅ Save the variable
2. ✅ Redeploy the site
3. ✅ Test by signing up a new user
4. ✅ Check function logs

## Security Notes

- ⚠️ **Never commit DATABASE_URL to Git** - It contains your database password
- ✅ Environment variables in Netlify are encrypted and secure
- ✅ The value is hidden in the Netlify UI (shown as dots)
- ✅ Only people with access to your Netlify account can see/edit it

