
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
//    Example: REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51HufXuL14f6l1f2PGy5LqI3rwev4tFw24T8X7bQpWIO2i7I8s4q4g9K2f8jG4j1h3n7c9f8d7g6e5d4c'; 

// 2. Your Stripe Price IDs (Stripe Dashboard > Products > Select Product > Pricing)
//    Example: REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
const STRIPE_PRICE_IDS = {
    pro: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1HufYJL14f6l1f2P9g8h7f6e',
        annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1HufYJL14f6l1f2P5d4c3b2a',
    },
    business: {
        monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_1HufZKL14f6l1f2P1a2b3c4d',
        annual: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || 'price_1HufZKL14f6l1f2P9h8g7f6e',
    },
};
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

export const redirectToCheckout = async (plan: 'pro' | 'business', billingCycle: 'monthly' | 'annual', userEmail: string) => {
  const stripe = getStripe();

  if (!stripe) {
      return;
  }

  const priceId = STRIPE_PRICE_IDS[plan][billingCycle];

  if (!priceId || priceId.includes('price_1H')) {
      console.warn(`Using a TEST Stripe Price ID: ${priceId}. Ensure you have set your live Price IDs in your environment variables for production.`);
  }
  
  // These URLs are where Stripe will redirect the user after checkout.
  // The success URL has a parameter that our App.tsx will check for to confirm the purchase.
  const successUrl = `${window.location.origin}${window.location.pathname}?payment=success`;
  const cancelUrl = `${window.location.origin}${window.location.pathname}`;

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: successUrl,
    cancelUrl: cancelUrl,
    customerEmail: userEmail, // Pass the user's email to Stripe
  });

  if (error) {
    console.error("Error redirecting to Stripe Checkout:", error);
    alert(`Could not redirect to payment page: ${error.message}`);
  }
};
