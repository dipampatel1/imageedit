
import React from 'react';
import type { UserProfile } from '../types';

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
    if (!userProfile) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
                        <span className="text-slate-400">Generations Left</span>
                        <span className="font-semibold text-white">
                             {isProUser ? 'Unlimited' : generationsLeft}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 space-y-3">
                 <button 
                    onClick={onManageSubscription}
                    className="w-full text-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    Manage Subscription
                 </button>
                 <button 
                    onClick={onSignOut}
                    className="w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                 >
                    Sign Out
                 </button>
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

export default UserPortalModal;
