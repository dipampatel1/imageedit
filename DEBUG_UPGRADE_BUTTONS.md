# Debugging Upgrade Plan Buttons

## Issue
Upgrade plan buttons are not working when clicked.

## What I Fixed

1. **Added comprehensive logging** - Now you'll see detailed console logs when clicking upgrade buttons
2. **Fixed price ID validation** - Corrected the logic that checks for valid Stripe Price IDs
3. **Added error handling** - Better error messages to identify the exact issue
4. **Added validation** - Checks for missing email, invalid price IDs, and missing Stripe keys

## How to Debug

### Step 1: Open Browser Console
1. Open your website
2. Press `F12` or right-click → "Inspect" → "Console" tab
3. Click an upgrade button
4. Look for console messages starting with:
   - 🔵 = Information/flow tracking
   - ⚠️ = Warning (may still work)
   - ❌ = Error (needs fixing)
   - ✅ = Success

### Step 2: Check Console Messages

When you click an upgrade button, you should see:
```
🔵 handleUpgrade called: { tier: 'starter', billingCycle: 'monthly', hasUser: true }
🔵 redirectToCheckout called: { tier: 'starter', billingCycle: 'monthly', userEmail: '...' }
🔵 Price ID: price_xxxxx for tier: starter billing: monthly
🔵 Redirecting to Stripe Checkout with: { priceId: '...', ... }
✅ Successfully initiated Stripe Checkout redirect
```

### Step 3: Common Issues and Fixes

#### Issue 1: "Payment configuration incomplete"
**Console shows:**
```
⚠️ Using a placeholder Stripe Price ID: price_starter_monthly
```

**Fix:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Set these variables (with `VITE_` prefix):
   - `VITE_STRIPE_STARTER_MONTHLY_PRICE_ID` = `price_xxxxx` (from Stripe Dashboard)
   - `VITE_STRIPE_STARTER_ANNUAL_PRICE_ID` = `price_xxxxx`
   - `VITE_STRIPE_PRO_MONTHLY_PRICE_ID` = `price_xxxxx`
   - `VITE_STRIPE_PRO_ANNUAL_PRICE_ID` = `price_xxxxx`
   - `VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID` = `price_xxxxx`
   - `VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID` = `price_xxxxx`
3. Redeploy your site

#### Issue 2: "Stripe.js has not been loaded"
**Console shows:**
```
❌ Stripe instance not available
```

**Fix:**
- This should not happen as Stripe.js is loaded in `index.html`
- If it does, check that `index.html` has: `<script src="https://js.stripe.com/v3/"></script>`
- Clear browser cache and reload

#### Issue 3: "No Price ID found"
**Console shows:**
```
❌ No Price ID found for: { tier: 'starter', billingCycle: 'monthly' }
```

**Fix:**
- Environment variables are not set or not accessible
- Check Netlify environment variables (must have `VITE_` prefix)
- Redeploy after setting variables

#### Issue 4: "Invalid Price ID format"
**Console shows:**
```
❌ Invalid Price ID format: price_starter_monthly
```

**Fix:**
- Price IDs must start with `price_` followed by your actual Stripe Price ID
- Example: `price_1ABC123def456GHI789` (not `price_starter_monthly`)
- Get real Price IDs from Stripe Dashboard → Products → Select Product → Pricing

#### Issue 5: "Stripe instance not available"
**Console shows:**
```
❌ Stripe instance not available
```

**Possible causes:**
- Stripe publishable key is missing or invalid
- Check `VITE_STRIPE_PUBLISHABLE_KEY` in Netlify environment variables
- Should start with `pk_live_` or `pk_test_`

## Getting Stripe Price IDs

1. **Log in to Stripe Dashboard**: https://dashboard.stripe.com
2. **Go to Products**: Left sidebar → Products
3. **Select/Create Product**: 
   - If you have products, click on one
   - If not, create a new product for each tier (Starter, Pro, Business)
4. **Add Pricing**:
   - Click "Add pricing" or edit existing pricing
   - Set price (e.g., $9.99/month for Starter)
   - Choose "Recurring" → "Monthly" or "Yearly"
   - Save
5. **Copy Price ID**:
   - The Price ID appears as `price_xxxxx` (e.g., `price_1ABC123def456GHI789`)
   - Copy this ID
6. **Set in Netlify**:
   - Go to Netlify → Site settings → Environment variables
   - Add variable: `VITE_STRIPE_STARTER_MONTHLY_PRICE_ID` = `price_xxxxx`
   - Repeat for all tiers and billing cycles

## Testing

After fixing the issues:

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Redeploy on Netlify** (or wait for auto-deploy if connected to GitHub)
3. **Open website** and click upgrade button
4. **Check console** for success messages
5. **Should redirect** to Stripe Checkout page

## Still Not Working?

If buttons still don't work after checking all above:

1. **Share console logs** - Copy all console messages when clicking upgrade
2. **Check Netlify environment variables** - Verify all `VITE_STRIPE_*` variables are set
3. **Verify Stripe account** - Make sure your Stripe account is active
4. **Test with Stripe test mode** - Use test Price IDs and test publishable key first

