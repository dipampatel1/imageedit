
import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { PRICING_TIERS, redirectToCheckout } from '../services/stripeService';
import ImageGallery from './ImageGallery';

interface UserPortalModalProps {
  onClose: () => void;
  userProfile: UserProfile | null;
  isProUser: boolean;
  generationsLeft: number;
  onSignOut: () => void;
  onManageSubscription: () => void;
}

const UserPortalModal: React.FC<UserPortalModalProps> = ({ 
  onClose, 
  userProfile, 
  isProUser, 
  generationsLeft,
  onSignOut,
  onManageSubscription
}) => {
  const [showGallery, setShowGallery] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  
  if (!userProfile) return null;

  const handleUpgrade = async (tier: 'starter' | 'pro' | 'business', billingCycle: 'monthly' | 'annual') => {
    console.log('🔵 handleUpgrade called:', { tier, billingCycle, email: userProfile.email });
    
    if (!userProfile?.email) {
      console.error('❌ User email not available');
      alert('User email is required for checkout. Please sign in again.');
      return;
    }

    try {
      await redirectToCheckout(tier, billingCycle, userProfile.email);
    } catch (error: any) {
      console.error('❌ Error in handleUpgrade:', error);
      alert(`Failed to start checkout: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
            aria-label="Close user portal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="p-8">
            <div className="text-center mb-6">
                 <img src={userProfile.imageUrl} alt={userProfile.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-600" />
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-slate-400">{userProfile.email}</p>
            </div>

            <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Plan</span>
                        <span className={`font-semibold px-3 py-1 text-sm rounded-full ${isProUser ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {isProUser ? 'Pro Plan' : 'Free Plan'}
                        </span>
                    </div>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Images Remaining</span>
                        <span className={`font-semibold ${generationsLeft <= 3 ? 'text-yellow-400' : 'text-white'}`}>
                             {generationsLeft === Infinity ? '∞' : generationsLeft}
                        </span>
                    </div>
                </div>
            </div>
            
            {showPricing && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Upgrade Your Plan</h3>
                <p className="text-sm text-slate-400 mb-4">Competitive pricing with industry-leading features</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-white mb-2">{PRICING_TIERS.starter.name}</h4>
                    <p className="text-2xl font-bold text-cyan-400 mb-2">${PRICING_TIERS.starter.price}/mo</p>
                    <p className="text-xs text-slate-400 mb-3">or ${(PRICING_TIERS.starter.price * 12 * (1 - 0.17)).toFixed(2)}/year (Save 17%)</p>
                    <ul className="text-sm text-slate-300 space-y-1 mb-4">
                      {PRICING_TIERS.starter.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade('starter', 'monthly')}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Upgrade to Starter
                    </button>
                    <button
                      onClick={() => handleUpgrade('starter', 'annual')}
                      className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Annual (Save 17%)
                    </button>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-cyan-500">
                    <h4 className="font-bold text-white mb-2">{PRICING_TIERS.pro.name}</h4>
                    <p className="text-2xl font-bold text-cyan-400 mb-2">${PRICING_TIERS.pro.price}/mo</p>
                    <p className="text-xs text-slate-400 mb-3">or ${(PRICING_TIERS.pro.price * 12 * (1 - 0.17)).toFixed(2)}/year (Save 17%)</p>
                    <ul className="text-sm text-slate-300 space-y-1 mb-4">
                      {PRICING_TIERS.pro.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade('pro', 'monthly')}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Upgrade to Pro
                    </button>
                    <button
                      onClick={() => handleUpgrade('pro', 'annual')}
                      className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Annual (Save 17%)
                    </button>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-white mb-2">{PRICING_TIERS.business.name}</h4>
                    <p className="text-2xl font-bold text-cyan-400 mb-2">${PRICING_TIERS.business.price}/mo</p>
                    <p className="text-xs text-slate-400 mb-3">or ${(PRICING_TIERS.business.price * 12 * (1 - 0.17)).toFixed(2)}/year (Save 17%)</p>
                    <ul className="text-sm text-slate-300 space-y-1 mb-4">
                      {PRICING_TIERS.business.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpgrade('business', 'monthly')}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Upgrade to Business
                    </button>
                    <button
                      onClick={() => handleUpgrade('business', 'annual')}
                      className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Annual (Save 17%)
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 space-y-3">
                 <button 
                    onClick={() => setShowGallery(true)}
                    className="w-full text-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    View Image Gallery
                 </button>
                 <button 
                    onClick={() => setShowPricing(!showPricing)}
                    className="w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {showPricing ? 'Hide' : 'Upgrade Plan'}
                 </button>
                 <button 
                    onClick={onSignOut}
                    className="w-full text-center bg-red-900/50 hover:bg-red-800/50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                 >
                    Sign Out
                 </button>
            </div>
            
            {showGallery && (
              <ImageGallery onClose={() => setShowGallery(false)} />
            )}
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

export default UserPortalModal;
