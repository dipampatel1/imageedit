# Neon Auth Setup Guide

## Overview

Neon Auth (powered by Stack Auth) automatically creates users in the `neon_auth` schema when they sign up. Users should **NOT** be created in the `public` schema manually.

## How It Works

1. **User Signs Up**: When a user signs up via Stack Auth components (`<SignUp />`), they are automatically created in the `neon_auth.users_sync` table.

2. **Schema Structure**:
   - `neon_auth.users_sync` - Managed by Neon Auth (read-only, synced from Stack Auth)
   - `public.user_usage` - Your application table for subscription tiers and usage tracking

3. **User ID Linking**: The `user_id` in `user_usage` table should match the `id` from `neon_auth.users_sync`.

## Setup Steps

### 1. Provision Neon Auth

You need to provision Neon Auth in your Neon project. This can be done via:

**Option A: Neon Console**
1. Go to your Neon project dashboard
2. Navigate to "Auth" or "Neon Auth" section
3. Click "Provision Neon Auth" or "Set up authentication"
4. Follow the setup wizard

**Option B: Neon MCP Tool (if available)**
```bash
# Use the Neon MCP tool to provision auth
mcp_Neon_provision_neon_auth
```

### 2. Get Stack Auth Credentials

After provisioning, you'll receive:
- `NEXT_PUBLIC_STACK_PROJECT_ID` (or `VITE_STACK_PROJECT_ID`)
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (or `VITE_STACK_PUBLISHABLE_CLIENT_KEY`)
- `STACK_SECRET_SERVER_KEY` (server-side only)

### 3. Set Environment Variables in Netlify

Add these to your Netlify environment variables:

```
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key
```

**Note**: For Vite, you can also use `VITE_` prefix:
```
VITE_STACK_PROJECT_ID=your_project_id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
```

### 4. Verify Setup

1. **Check `neon_auth` schema exists**:
   ```sql
   SELECT * FROM information_schema.schemata WHERE schema_name = 'neon_auth';
   ```

2. **Check `users_sync` table exists**:
   ```sql
   SELECT * FROM neon_auth.users_sync LIMIT 1;
   ```

3. **Test sign-up**: Create a new user account and verify they appear in `neon_auth.users_sync`:
   ```sql
   SELECT * FROM neon_auth.users_sync WHERE email = 'test@example.com';
   ```

## Current Implementation

The app now uses:
- `<StackProvider>` and `<StackTheme>` in `index.tsx`
- `<SignUp />` and `<SignIn />` components from `@stackframe/stack` in `AuthModal.tsx`
- `useUser()` and `useStackApp()` hooks for accessing user data

## Troubleshooting

### Users Still Created in Public Schema

If users are still being created in the `public` schema:

1. **Check Stack Auth is configured**:
   - Verify environment variables are set correctly
   - Check browser console for Stack Auth errors
   - Ensure `StackProvider` is wrapping your app

2. **Check AuthModal is using Stack Auth**:
   - `AuthModal.tsx` should use `<SignUp />` and `<SignIn />` components
   - Not using `authService.signUp()` directly (which would use localStorage)

3. **Verify Neon Auth is provisioned**:
   - Check Neon Console for "Neon Auth" or "Authentication" section
   - Ensure `neon_auth` schema exists in your database

### Users Not Appearing in neon_auth.users_sync

1. **Check Stack Auth credentials**:
   - Verify `NEXT_PUBLIC_STACK_PROJECT_ID` is correct
   - Verify `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` is correct

2. **Check for errors**:
   - Browser console for client-side errors
   - Netlify function logs for server-side errors

3. **Verify sign-up flow**:
   - Ensure user completes the sign-up form
   - Check that `onSignUpComplete` callback is triggered

## Important Notes

- **Never manually insert into `neon_auth.users_sync`**: This table is managed by Neon Auth
- **Use `user_usage` table for application data**: Subscription tiers, usage tracking, etc.
- **Link via user ID**: Use the `id` from `neon_auth.users_sync` as `user_id` in `user_usage`

