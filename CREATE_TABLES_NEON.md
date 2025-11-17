# Create Database Tables in Neon

## The Problem

The error `"relation \"user_usage\" does not exist"` means the database tables haven't been created yet. You need to run the schema SQL script in Neon.

## Solution: Run the Schema Script

### Step 1: Open Neon SQL Editor

1. **Go to Neon Console:**
   - Visit https://console.neon.tech
   - Sign in and select your project

2. **Open SQL Editor:**
   - Click on **"SQL Editor"** in the left sidebar
   - Or go to your project → **"SQL Editor"** tab

### Step 2: Run the Schema Script

1. **Open the schema file:**
   - In your project, open `database/schema.sql`
   - Copy the **entire contents** of the file

2. **Paste into Neon SQL Editor:**
   - Paste the entire schema SQL into the SQL Editor
   - Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)

3. **Verify Tables Created:**
   - After running, you should see a success message
   - Run this query to verify:
     ```sql
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('user_usage', 'image_history');
     ```
   - Should return both `user_usage` and `image_history`

### Step 3: Verify Table Structure

Run this query to check the `user_usage` table structure:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_usage'
ORDER BY ordinal_position;
```

Should see columns like:
- `id`
- `user_id`
- `email`
- `tier`
- `user_level`
- `images_generated`
- `current_period_start`
- `current_period_end`
- `created_at`
- `updated_at`

### Step 4: Test Again

After creating the tables:

1. **Try signing up again** with a new email
2. **Check Netlify Function Logs:**
   - Should NOT see `"relation \"user_usage\" does not exist"` ❌
   - Should see successful user creation ✅
3. **Check Neon Database:**
   - Run: `SELECT * FROM user_usage ORDER BY created_at DESC LIMIT 5;`
   - Should see the new user record

## Quick Copy-Paste Schema

If you need the schema quickly, here's what to run in Neon SQL Editor:

```sql
-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'free',
    user_level VARCHAR(50) NOT NULL DEFAULT 'user',
    images_generated INTEGER NOT NULL DEFAULT 0,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create image_history table
CREATE TABLE IF NOT EXISTS image_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    image_id VARCHAR(255) NOT NULL,
    base64_data TEXT NOT NULL,
    mime_type VARCHAR(100),
    original_name VARCHAR(255),
    prompt TEXT,
    mode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, image_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_email ON user_usage(email);
CREATE INDEX IF NOT EXISTS idx_user_usage_tier ON user_usage(tier);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_level ON user_usage(user_level);
CREATE INDEX IF NOT EXISTS idx_image_history_user_id ON image_history(user_id);
CREATE INDEX IF NOT EXISTS idx_image_history_created_at ON image_history(created_at DESC);
```

## Troubleshooting

### Error: "permission denied"
- Make sure you're connected as the database owner (`neondb_owner`)
- Check that you have the correct connection string

### Error: "table already exists"
- This is fine - the `IF NOT EXISTS` clause will skip creation
- Your tables are already created

### Tables created but still getting errors
- Make sure you're connected to the correct database (usually `neondb`)
- Verify the table names match exactly: `user_usage` and `image_history` (lowercase)

