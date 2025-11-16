# Stripe Setup Guide for Netlify

## Step 1: Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**

### Create 3 Products:

#### Product 1: Starter Plan
- **Name**: "Starter Plan"
- **Description**: "200 images per month with high resolution and priority support"
- **Pricing**: 
  - Monthly: $9.99/month (recurring)
  - Annual: $99.48/year (recurring) - This is $9.99 × 12 × (1 - 0.17) = $99.48
- **Copy the Price IDs** (they start with `price_...`)

#### Product 2: Pro Plan
- **Name**: "Pro Plan"
- **Description**: "1,000 images per month with ultra-high resolution and commercial license"
- **Pricing**:
  - Monthly: $24.99/month (recurring)
  - Annual: $249.48/year (recurring) - This is $24.99 × 12 × (1 - 0.17) = $249.48
- **Copy the Price IDs**

#### Product 3: Business Plan
- **Name**: "Business Plan"
- **Description**: "5,000 images per month with unlimited API access and team features"
- **Pricing**:
  - Monthly: $79/month (recurring)
  - Annual: $787.32/year (recurring) - This is $79 × 12 × (1 - 0.17) = $787.32
- **Copy the Price IDs**

## Step 2: Add Price IDs to Netlify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"** for each of the following:

### Required Environment Variables:

**For Vite projects, use the `VITE_` prefix:**

```
VITE_STRIPE_STARTER_MONTHLY_PRICE_ID = price_xxxxxxxxxxxxx
VITE_STRIPE_STARTER_ANNUAL_PRICE_ID = price_xxxxxxxxxxxxx
VITE_STRIPE_PRO_MONTHLY_PRICE_ID = price_xxxxxxxxxxxxx
VITE_STRIPE_PRO_ANNUAL_PRICE_ID = price_xxxxxxxxxxxxx
VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID = price_xxxxxxxxxxxxx
VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID = price_xxxxxxxxxxxxx
```

**Note:** The code also supports variables without the `VITE_` prefix for backward compatibility, but `VITE_` prefix is recommended for Vite projects.

### Also Add Your Stripe Publishable Key:

**For Vite projects, use the `VITE_` prefix:**

```
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_xxxxxxxxxxxxx
```

(Or `pk_test_...` for testing)

**Note:** The code also supports `STRIPE_PUBLISHABLE_KEY` without the prefix for backward compatibility, but `VITE_` prefix is recommended for Vite projects.

## Step 3: Verify Environment Variables

After adding all variables:
1. Make sure they're saved
2. Go to **Deploys** tab
3. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
4. This ensures the new environment variables are available

## Step 4: Test the Integration

1. Visit your deployed site
2. Sign in as a user
3. Go to User Portal → Upgrade Plan
4. Click on any upgrade button
5. You should be redirected to Stripe Checkout with the correct pricing

## Important Notes:

- **Test Mode**: Use `pk_test_...` and test Price IDs during development
- **Live Mode**: Switch to `pk_live_...` and live Price IDs for production
- **Price IDs**: Always start with `price_` and are unique to each pricing tier
- **Annual Pricing**: Make sure to calculate correctly with 17% discount
- **Redeploy**: Always redeploy after adding/changing environment variables

## Troubleshooting:

- **Price ID not found**: Check that Price IDs are correct and match Stripe Dashboard
- **Wrong price shown**: Verify the Price ID matches the correct tier and billing cycle
- **Checkout not working**: Ensure Stripe Publishable Key is set correctly
- **Environment variables not loading**: Redeploy the site after adding variables

