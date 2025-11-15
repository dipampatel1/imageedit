# Neon Auth Integration Guide

## Important: Authentication vs Subscription Management

**Neon Auth (Stack Auth) handles:**
- User authentication (sign up, sign in, sign out)
- Password management (stored securely by Stack Auth)
- User profile data (name, email, profile image)
- User ID generation

**Your Database (`user_usage` table) handles:**
- Subscription tier (free, starter, pro, business)
- Usage tracking (images generated)
- Billing period management

## How It Works

### User Flow:

1. **Sign Up/Sign In**: 
   - User authenticates via Neon Auth (Stack Auth)
   - Neon Auth returns user ID and profile info
   - No password or subscription data stored in your database

2. **Get Subscription Tier**:
   - Use `getCompleteUser()` from `userService.ts`
   - This combines:
     - Auth data from Neon Auth (profile, user ID)
     - Subscription data from `user_usage` table (tier, usage)

3. **Subscription Updates**:
   - When user upgrades via Stripe, a webhook updates the `user_usage` table
   - The `tier` column in `user_usage` is updated (free → starter/pro/business)
   - Auth system is NOT modified

## Database Schema

The `user_usage` table stores subscription information:

```sql
CREATE TABLE user_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,  -- Links to Neon Auth user ID
    email VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'free',  -- 'free', 'starter', 'pro', 'business'
    images_generated INTEGER NOT NULL DEFAULT 0,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    ...
);
```

## Code Structure

### Services:

1. **`authService.ts`**: 
   - Handles authentication only
   - Returns: `{ profile: UserProfile, userId?: string }`
   - Does NOT return subscription tier

2. **`userService.ts`**: 
   - Combines auth + subscription data
   - Returns: `CompleteUser` with subscription tier from database
   - Use this when you need subscription info

3. **`usageService.ts`**: 
   - Manages usage tracking and limits
   - Gets subscription tier from `user_usage` table

## Usage Examples

### Get User with Subscription Info:

```typescript
import { getCompleteUser } from './services/userService';

const user = await getCompleteUser();
if (user) {
  console.log(user.profile.name);        // From Neon Auth
  console.log(user.subscriptionTier);   // From user_usage table
  console.log(user.isPro);              // Calculated from tier
}
```

### Get Usage Info:

```typescript
import { getUserUsage } from './services/usageService';

const usage = await getUserUsage();
if (usage) {
  console.log(usage.tier);              // 'free', 'starter', 'pro', 'business'
  console.log(usage.images_generated);  // Number of images used
}
```

## Stripe Webhook Integration

When a user upgrades, Stripe sends a webhook that should:

1. Extract user email or user ID from Stripe metadata
2. Update the `user_usage` table:
   ```sql
   UPDATE user_usage 
   SET tier = 'starter'  -- or 'pro', 'business'
   WHERE user_id = ? OR email = ?
   ```

## Key Points

- ✅ Passwords are managed by Neon Auth (secure, encrypted)
- ✅ Subscription tiers are in your `user_usage` table
- ✅ User ID from Neon Auth links auth to subscription data
- ✅ Always use `getCompleteUser()` when you need subscription info
- ❌ Don't try to get subscription tier from auth system
- ❌ Don't store passwords in your database

