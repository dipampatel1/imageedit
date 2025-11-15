import React, { useState } from 'react';
import { PRICING_TIERS, ANNUAL_DISCOUNT, redirectToCheckout } from '../services/stripeService';
import * as authService from '../services/authService';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [user, setUser] = useState<{ profile: { email: string } } | null>(null);

  React.useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  const handleUpgrade = async (tier: 'starter' | 'pro' | 'business') => {
    if (!user) {
      // Show sign up modal or redirect to sign up
      alert('Please sign up to upgrade your plan');
      return;
    }
    await redirectToCheckout(tier, billingCycle, user.profile.email);
  };

  const calculateAnnualPrice = (monthlyPrice: number): number => {
    return monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Competitive pricing with industry-leading features
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-slate-700 rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'text-white font-semibold' : 'text-slate-400'}`}>
              Annual
              <span className="ml-2 text-cyan-400 text-xs">Save {ANNUAL_DISCOUNT * 100}%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Tier */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">{PRICING_TIERS.free.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">${PRICING_TIERS.free.price}</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {PRICING_TIERS.free.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => !user && alert('Please sign up to get started')}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              {user ? 'Current Plan' : 'Get Started'}
            </button>
          </div>

          {/* Starter Tier */}
          <div className="bg-slate-800/50 border-2 border-cyan-500 rounded-2xl p-6 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{PRICING_TIERS.starter.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                ${billingCycle === 'annual' ? calculateAnnualPrice(PRICING_TIERS.starter.price).toFixed(2) : PRICING_TIERS.starter.price}
              </span>
              <span className="text-slate-400">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
              {billingCycle === 'annual' && (
                <div className="text-sm text-slate-400 mt-1">
                  ${PRICING_TIERS.starter.price}/month billed annually
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              {PRICING_TIERS.starter.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('starter')}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
              Upgrade to Starter
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">{PRICING_TIERS.pro.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                ${billingCycle === 'annual' ? calculateAnnualPrice(PRICING_TIERS.pro.price).toFixed(2) : PRICING_TIERS.pro.price}
              </span>
              <span className="text-slate-400">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
              {billingCycle === 'annual' && (
                <div className="text-sm text-slate-400 mt-1">
                  ${PRICING_TIERS.pro.price}/month billed annually
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              {PRICING_TIERS.pro.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Business Tier */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">{PRICING_TIERS.business.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                ${billingCycle === 'annual' ? calculateAnnualPrice(PRICING_TIERS.business.price).toFixed(2) : PRICING_TIERS.business.price}
              </span>
              <span className="text-slate-400">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
              {billingCycle === 'annual' && (
                <div className="text-sm text-slate-400 mt-1">
                  ${PRICING_TIERS.business.price}/month billed annually
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-6">
              {PRICING_TIERS.business.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('business')}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
              Upgrade to Business
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
            <span>✓ Secure payment processing</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Priority customer support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

