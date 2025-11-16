# Supabase Setup Guide

This guide will help you set up Supabase for your Image Edit application.

## Part 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Name**: Your project name (e.g., "Image Edit")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
5. Click **"Create new project"**
6. Wait for the project to be created (takes 1-2 minutes)

## Part 2: Get Your Supabase Credentials

### Step 1: Get Project URL and Anon Key (for client-side)

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Find the **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Find the **anon/public key** (starts with `eyJ...`)
4. Copy both values

### Step 2: Get Service Role Key (for server-side/Netlify functions)

1. Still in **Settings** → **API**
2. Find the **service_role key** (starts with `eyJ...`)
   - ⚠️ **WARNING**: This key has admin privileges. Never expose it in client-side code!
   - Only use it in Netlify Functions (server-side)

### Step 3: Get Project Reference (for admin panel link)

1. Look at your Supabase dashboard URL
2. The URL format is: `https://supabase.com/dashboard/project/{project_ref}`
3. Copy the `project_ref` part (e.g., `abcdefghijklmnop`)

## Part 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `database/schema.sql`
4. Click **"Run"** to execute the SQL
5. Verify tables were created:
   - Go to **Table Editor** → You should see `user_usage` and `image_history` tables

## Part 4: Configure Environment Variables

### For Local Development

Create or update `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For admin panel link
VITE_SUPABASE_PROJECT_REF=abcdefghijklmnop
```

### For Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

#### Required Variables:
- **Key**: `SUPABASE_URL`
  - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
  - **Value**: Your Supabase service role key (from Settings → API)
  - ⚠️ **Important**: This is the service_role key, NOT the anon key!

#### Client-Side Variables (for Vite):
- **Key**: `VITE_SUPABASE_URL`
  - **Value**: Same as `SUPABASE_URL`

- **Key**: `VITE_SUPABASE_ANON_KEY`
  - **Value**: Your Supabase anon/public key (from Settings → API)

- **Key**: `VITE_SUPABASE_PROJECT_REF` (optional)
  - **Value**: Your Supabase project reference (for admin panel link)

## Part 5: Enable Row Level Security (RLS)

Supabase uses Row Level Security (RLS) to protect your data. You need to configure policies:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. For `user_usage` table:
   - Click **"New Policy"**
   - Policy name: "Users can read their own usage"
   - Allowed operation: `SELECT`
   - Policy definition: `user_id = auth.uid()::text`
   - Click **"Save"**

3. For `image_history` table:
   - Click **"New Policy"**
   - Policy name: "Users can manage their own images"
   - Allowed operations: `SELECT`, `INSERT`, `DELETE`
   - Policy definition: `user_id = auth.uid()::text`
   - Click **"Save"**

**Note**: Since we're using the service role key in Netlify Functions, RLS is bypassed for server-side operations. This is intentional for our use case.

## Part 6: Test the Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Try signing up**:
   - Go to your app
   - Click "Sign Up"
   - Create a test account
   - Check Supabase dashboard → **Table Editor** → `user_usage` table
   - You should see a new row with your user data

4. **Check Netlify Functions** (after deployment):
   - Go to Netlify dashboard → **Functions** tab
   - Check function logs for any errors
   - Verify database operations are working

## Troubleshooting

### Issue: "Supabase client not available"
- **Fix**: Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly

### Issue: "Database connection not configured"
- **Fix**: Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in Netlify environment variables

### Issue: "User not created in database"
- **Fix**: 
  1. Check Netlify function logs
  2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not the anon key!)
  3. Check that tables exist in Supabase (run schema.sql if needed)

### Issue: "Permission denied" or RLS errors
- **Fix**: 
  1. Check RLS policies are set up correctly
  2. Verify you're using service_role key in Netlify Functions (not anon key)

### Issue: Tables don't exist
- **Fix**: Run the `database/schema.sql` script in Supabase SQL Editor

## Security Notes

- ✅ **Anon Key**: Safe to expose in client-side code (respects RLS)
- ⚠️ **Service Role Key**: NEVER expose in client-side code. Only use in server-side functions.
- 🔒 **RLS Policies**: Configure policies to restrict data access based on user ID
- 🔐 **Database Password**: Keep your database password secure

## Next Steps

- Set up admin users (see `ADMIN_SETUP.md`)
- Configure Stripe for payments (see `STRIPE_SETUP_GUIDE.md`)
- Set up email templates in Supabase (optional, for password reset emails)

