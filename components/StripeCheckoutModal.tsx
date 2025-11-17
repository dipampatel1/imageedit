
import React, { useState } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { LogoIcon } from './icons/LogoIcon';
import { redirectToCheckout } from '../services/stripeService';
import { StripeIcon } from './payment/StripeIcon';
import { GooglePayIcon } from './payment/GooglePayIcon';
import { PayPalIcon } from './payment/PayPalIcon';
import { AmazonPayIcon } from './payment/AmazonPayIcon';
import type { UserProfile } from '../types';

interface StripeCheckoutModalProps {
    onClose: () => void;
    userProfile: UserProfile | null;
}

const plans = {
    monthly: {
        pro: { price: 15, credits: 500, features: ['Advanced editing tools', 'High-resolution exports', 'Priority processing'] },
        business: { price: 40, credits: 2000, features: ['Team collaboration', 'Shared asset library', 'Brand kit & templates', 'Advanced API access'] }
    },
    annual: {
        pro: { price: 12, credits: 500, features: ['Advanced editing tools', 'High-resolution exports', 'Priority processing'] },
        business: { price: 32, credits: 2000, features: ['Team collaboration', 'Shared asset library', 'Brand kit & templates', 'Advanced API access'] }
    }
};

const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({ onClose, userProfile }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePlan = async (plan: 'pro' | 'business') => {
    if (!userProfile?.email) {
      alert("Could not process payment. User email is not available.");
      return;
    }
    setIsLoading(true);
    try {
      await redirectToCheckout(plan, billingCycle, userProfile.email);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Could not initiate payment. Please try again.");
    } finally {
      // If redirect fails or is blocked by the user, stop loading
      setIsLoading(false);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-4xl m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
            <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20">
                <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-semibold text-white text-lg">Connecting to secure payment...</p>
                <p className="text-slate-400 text-sm">You will be redirected shortly.</p>
            </div>
        )}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
            aria-label="Close payment modal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="p-8">
            <div className="text-center mb-8">
                <LogoIcon className="h-10 w-auto mx-auto mb-2" />
                <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
                <p className="text-slate-400 mt-1">Become a member to unlock powerful features.</p>
            </div>

             <div className="flex justify-center items-center gap-4 mb-8">
                <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={billingCycle === 'annual'} onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                </label>
                <span className={`font-semibold ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>Annual</span>
                <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-md">Save 20%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Pro Plan */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-cyan-400">Pro</h3>
                    <p className="text-slate-400 text-sm mb-4">For individuals and freelancers.</p>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-white">${plans[billingCycle].pro.price}</span>
                        <span className="text-slate-400">/ month</span>
                    </div>
                    <ul className="space-y-3 text-sm flex-grow">
                        <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-cyan-400" /> {plans[billingCycle].pro.credits} image credits / month</li>
                        {plans[billingCycle].pro.features.map(f => <li key={f} className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-cyan-400" /> {f}</li>)}
                    </ul>
                     <button onClick={() => handleChoosePlan('pro')} disabled={isLoading} className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105">
                        {isLoading ? 'Processing...' : 'Choose Pro'}
                     </button>
                </div>

                {/* Business Plan */}
                <div className="bg-slate-900/50 border-2 border-amber-500 rounded-xl p-6 flex flex-col relative">
                     <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-3 py-1 text-sm font-bold rounded-full">Most Popular</div>
                    <h3 className="text-xl font-bold text-amber-400">Business</h3>
                    <p className="text-slate-400 text-sm mb-4">For teams and agencies.</p>
                     <div className="mb-6">
                        <span className="text-4xl font-extrabold text-white">${plans[billingCycle].business.price}</span>
                        <span className="text-slate-400">/ user / month</span>
                    </div>
                     <ul className="space-y-3 text-sm flex-grow">
                        <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-amber-400" /> {plans[billingCycle].business.credits} credits per user / month</li>
                        {plans[billingCycle].business.features.map(f => <li key={f} className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-amber-400" /> {f}</li>)}
                    </ul>
                     <button onClick={() => handleChoosePlan('business')} disabled={isLoading} className="mt-8 w-full bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 text-slate-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105">
                        {isLoading ? 'Processing...' : 'Choose Business'}
                     </button>
                </div>
            </div>
            
            <div className="text-center flex justify-center items-center gap-6 my-6">
                <StripeIcon className="h-5" />
                <GooglePayIcon className="h-7" />
                <PayPalIcon className="h-5" />
                <AmazonPayIcon className="h-5" />
            </div>

            <div className="text-center border-t border-slate-700 pt-6">
                <h4 className="font-bold text-lg text-white">Enterprise</h4>
                <p className="text-slate-400 mt-1 mb-3">For large organizations with custom needs.</p>
                <button className="px-6 py-2 text-sm font-semibold border border-slate-600 hover:bg-slate-700 rounded-lg transition-colors">Contact Sales</button>
            </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default StripeCheckoutModal;
