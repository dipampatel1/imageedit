# Netlify Neon Integration Guide

## Overview

We're now using `@netlify/neon` package for better Netlify integration. This package automatically uses the `NETLIFY_DATABASE_URL` environment variable, which is the recommended way to connect to Neon databases from Netlify Functions.

## Environment Variables

### Recommended: `NETLIFY_DATABASE_URL`

Netlify automatically provides this when you connect a Neon database through the Netlify dashboard. This is the **preferred** method.

### Fallback: `DATABASE_URL`

If `NETLIFY_DATABASE_URL` is not set, the code will fall back to `DATABASE_URL` for backward compatibility.

## Setup Steps

### Option 1: Connect Neon Database via Netlify Dashboard (Recommended)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Integrations** → **Databases**
3. Click **Add database** → **Neon**
4. Follow the setup wizard to connect your Neon database
5. Netlify will automatically set `NETLIFY_DATABASE_URL` for you

### Option 2: Manual Setup

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add a new environment variable:
   - **Key**: `NETLIFY_DATABASE_URL`
   - **Value**: Your Neon database connection string (from Neon Console)
   - **Scopes**: All deploy contexts (or specific ones as needed)

## Connection String Format

Your Neon connection string should look like:
```
postgresql://username:password@hostname/database?sslmode=require
```

You can get this from:
1. Neon Console → Your Project → Connection Details
2. Copy the connection string

## Code Usage

All Netlify functions now use:

```typescript
import { neon } from '@netlify/neon';

// Automatically uses NETLIFY_DATABASE_URL or DATABASE_URL
const sql = neon();

// Use it like before
const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
```

## Benefits of @netlify/neon

1. **Automatic Configuration**: Uses `NETLIFY_DATABASE_URL` automatically
2. **Better Integration**: Optimized for Netlify's serverless environment
3. **Simpler Code**: No need to manually pass connection strings
4. **Backward Compatible**: Falls back to `DATABASE_URL` if needed

## Updated Functions

All Netlify functions have been updated:
- ✅ `netlify/functions/user-init.ts`
- ✅ `netlify/functions/usage-get.ts`
- ✅ `netlify/functions/usage-check.ts`
- ✅ `netlify/functions/usage-increment.ts`
- ✅ `netlify/functions/images-save.ts`
- ✅ `netlify/functions/images-get.ts`
- ✅ `netlify/functions/images-delete.ts`
- ✅ `netlify/functions/email-check.ts`

## Troubleshooting

### Error: "Database connection not configured"

1. **Check environment variables**:
   - Ensure `NETLIFY_DATABASE_URL` or `DATABASE_URL` is set in Netlify
   - Go to Site settings → Environment variables

2. **Verify connection string**:
   - Test the connection string in Neon Console SQL Editor
   - Ensure it includes `?sslmode=require`

3. **Redeploy after changes**:
   - After adding/updating environment variables, trigger a new deployment
   - Go to Deploys → Trigger deploy → Clear cache and deploy site

### Error: "Failed to initialize Neon client"

1. **Check package installation**:
   ```bash
   npm list @netlify/neon
   ```

2. **Verify Netlify build**:
   - Check Netlify build logs for errors
   - Ensure `@netlify/neon` is in `package.json` dependencies

## Migration Notes

- ✅ All functions updated to use `@netlify/neon`
- ✅ Backward compatible with `DATABASE_URL`
- ✅ No breaking changes to function APIs
- ✅ Same SQL query syntax

