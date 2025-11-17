
// Let TypeScript know that Stripe is available on the window object from the CDN
declare const Stripe: any;

// =================================================================================
// IMPORTANT: CONFIGURATION FOR LIVE ENVIRONMENT
//
// These values MUST be configured using environment variables before deploying your application.
// Using environment variables is a security best practice that keeps your secret keys
// out of the source code.
//
// HOW TO CONFIGURE:
// 1. In your deployment environment (e.g., Vercel, Netlify, or a custom server), set
//    the following environment variables with your LIVE values from your Stripe Dashboard.
// 2. For local development, you can create a `.env` file in your project's root
//    and define these variables there.
// =================================================================================

// 1. Your Stripe publishable key (Stripe Dashboard > Developers > API keys)
//    For Vite, use VITE_ prefix: VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                                 (typeof process !== 'undefined' && process.env?.STRIPE_PUBLISHABLE_KEY) || 
                                 'pk_test_51HufXuL14f6l1f2PGy5LqI3rwev4tFw24T8X7bQpWIO2i7I8s4q4g9K2f8jG4j1h3n7c9f8d7g6e5d4c'; 

// 2. Your Stripe Price IDs (Stripe Dashboard > Products > Select Product > Pricing)
// Competitive Pricing Model (Based on Market Research):
// - Free: 25 images/month (no payment required)
// - Starter: $9.99/month - 200 images included, $0.10 per image after
// - Pro: $24.99/month - 1,000 images included, $0.05 per image after
// - Business: $79/month - 5,000 images included, $0.03 per image after
// - Annual discount: 17% off (industry standard)
// For Vite, use VITE_ prefix for all environment variables
const STRIPE_PRICE_IDS = {
    starter: {
        monthly: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_PRICE_ID || 
                 (typeof process !== 'undefined' && process.env?.STRIPE_STARTER_MONTHLY_PRICE_ID) || 
                 'price_starter_monthly',
        annual: import.meta.env.VITE_STRIPE_STARTER_ANNUAL_PRICE_ID || 
                (typeof process !== 'undefined' && process.env?.STRIPE_STARTER_ANNUAL_PRICE_ID) || 
                'price_starter_annual',
    },
    pro: {
        monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || 
                 (typeof process !== 'undefined' && process.env?.STRIPE_PRO_MONTHLY_PRICE_ID) || 
                 'price_pro_monthly',
        annual: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID || 
                (typeof process !== 'undefined' && process.env?.STRIPE_PRO_ANNUAL_PRICE_ID) || 
                'price_pro_annual',
    },
    business: {
        monthly: import.meta.env.VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID || 
                 (typeof process !== 'undefined' && process.env?.STRIPE_BUSINESS_MONTHLY_PRICE_ID) || 
                 'price_business_monthly',
        annual: import.meta.env.VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID || 
                (typeof process !== 'undefined' && process.env?.STRIPE_BUSINESS_ANNUAL_PRICE_ID) || 
                'price_business_annual',
    },
};

// Competitive pricing configuration based on market research
// Positioned against: Midjourney ($10-60), Canva ($12.99), Adobe Firefly ($9.99+)
export const PRICING_TIERS = {
    free: {
        name: 'Free',
        price: 0,
        imagesIncluded: 25, // Increased from 10 to be more competitive
        overageRate: null,
        features: [
            '25 images per month',
            'Basic image editing',
            'Image generation',
            'Standard resolution (1024x1024)',
            'Watermark on downloads'
        ],
    },
    starter: {
        name: 'Starter',
        price: 9.99,
        imagesIncluded: 200, // Competitive with Midjourney Basic ($10 for 200)
        overageRate: 0.10, // $0.10 per additional image
        features: [
            '200 images per month',
            'All editing features',
            'High resolution (2048x2048)',
            'No watermarks',
            'Priority support',
            'Image history (last 100 images)',
            'Overage: $0.10/image'
        ],
    },
    pro: {
        name: 'Pro',
        price: 24.99, // More affordable than Midjourney Pro ($60)
        imagesIncluded: 1000,
        overageRate: 0.05, // $0.05 per additional image
        features: [
            '1,000 images per month',
            'All Starter features',
            'Ultra-high resolution (4096x4096)',
            'Unlimited image history',
            'Commercial license',
            'API access (limited)',
            'Priority processing',
            'Overage: $0.05/image'
        ],
    },
    business: {
        name: 'Business',
        price: 79,
        imagesIncluded: 5000,
        overageRate: 0.03, // $0.03 per additional image
        features: [
            '5,000 images per month',
            'All Pro features',
            'Unlimited API access',
            'White-label options',
            'Dedicated support',
            'Custom integrations',
            'Team collaboration',
            'Overage: $0.03/image'
        ],
    },
};

// Annual discount (17% - industry standard, better than 15%, less aggressive than 20%)
export const ANNUAL_DISCOUNT = 0.17; // 17% discount
// =================================================================================


let stripeInstance: any;

const getStripe = () => {
  if (!stripeInstance) {
    // Check if the Stripe script has been loaded from index.html
    if (typeof Stripe === 'undefined') {
        console.error('Stripe.js has not been loaded. Make sure the script tag is in your index.html.');
        alert('Payment processing is currently unavailable.');
        return null;
    }
    stripeInstance = Stripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripeInstance;
};

export const redirectToCheckout = async (tier: 'starter' | 'pro' | 'business', billingCycle: 'monthly' | 'annual', userEmail: string) => {
  console.log('🔵 redirectToCheckout called:', { tier, billingCycle, userEmail });
  
  const stripe = getStripe();

  if (!stripe) {
      console.error('❌ Stripe instance not available');
      return;
  }

  const priceId = STRIPE_PRICE_IDS[tier][billingCycle];
  console.log('🔵 Price ID:', priceId, 'for tier:', tier, 'billing:', billingCycle);

  if (!priceId) {
      console.error('❌ No Price ID found for:', { tier, billingCycle });
      alert('Payment configuration error: No price ID found. Please contact support.');
      return;
  }

  // Check if using placeholder/test price IDs
  if (priceId.startsWith('price_starter_') || priceId.startsWith('price_pro_') || priceId.startsWith('price_business_')) {
      console.warn('⚠️ Using a placeholder Stripe Price ID:', priceId);
      console.warn('⚠️ Ensure you have set your live Price IDs in your environment variables for production.');
      alert('Payment configuration incomplete. Please set up Stripe Price IDs in your environment variables.');
      return;
  }

  // Validate that priceId is a valid Stripe price ID format (starts with 'price_')
  if (!priceId.startsWith('price_')) {
      console.error('❌ Invalid Price ID format:', priceId);
      alert('Payment configuration error: Invalid price ID format. Please contact support.');
      return;
  }

  // Validate Stripe publishable key
  if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_51HufXu')) {
      console.warn('⚠️ Using test/placeholder Stripe publishable key');
      console.warn('⚠️ Ensure you have set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.');
  }
  
  // These URLs are where Stripe will redirect the user after checkout.
  // The success URL has a parameter that our App.tsx will check for to confirm the purchase.
  const successUrl = `${window.location.origin}${window.location.pathname}?payment=success&tier=${tier}`;
  const cancelUrl = `${window.location.origin}${window.location.pathname}`;

  console.log('🔵 Redirecting to Stripe Checkout with:', {
    priceId,
    successUrl,
    cancelUrl,
    customerEmail: userEmail
  });

  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      customerEmail: userEmail, // Pass the user's email to Stripe
      metadata: {
        tier: tier,
        billingCycle: billingCycle,
      },
    });

    if (error) {
      console.error("❌ Error redirecting to Stripe Checkout:", error);
      alert(`Could not redirect to payment page: ${error.message}`);
    } else {
      console.log('✅ Successfully initiated Stripe Checkout redirect');
    }
  } catch (err: any) {
    console.error("❌ Exception during Stripe Checkout:", err);
    alert(`Payment error: ${err.message || 'An unexpected error occurred. Please try again.'}`);
  }
};
