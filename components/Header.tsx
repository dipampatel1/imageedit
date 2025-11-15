import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import * as authService from '../services/authService';
import type { UserProfile } from '../types';
import AuthModal from './AuthModal';
import UserPortalModal from './UserPortalModal';

export const Header: React.FC = () => {
  const [user, setUser] = useState<{ profile: UserProfile, isPro: boolean } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);

  useEffect(() => {
    // Load user on mount
    loadUser();
    
    // Listen for auth changes (e.g., after sign in/out)
    const interval = setInterval(loadUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    setShowUserPortal(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    loadUser();
  };

  return (
    <header className="bg-slate-900/60 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <LogoIcon className="h-8 w-auto" />
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300 hidden sm:inline">
                  {user.profile.name}
                </span>
                <button
                  onClick={() => setShowUserPortal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <img 
                    src={user.profile.imageUrl} 
                    alt={user.profile.name}
                    className="w-8 h-8 rounded-full"
                  />
                  {user.isPro && (
                    <span className="text-xs bg-cyan-600 text-white px-2 py-1 rounded-full">
                      Pro
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* User Portal Modal */}
      {showUserPortal && user && (
        <UserPortalModal
          onClose={() => setShowUserPortal(false)}
          userProfile={user.profile}
          isProUser={user.isPro}
          generationsLeft={user.isPro ? Infinity : 10} // TODO: Get from usage service
          onSignOut={handleSignOut}
          onManageSubscription={() => {
            setShowUserPortal(false);
            // TODO: Open Stripe checkout
          }}
        />
      )}
    </header>
  );
};