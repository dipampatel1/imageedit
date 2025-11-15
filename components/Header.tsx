import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import * as authService from '../services/authService';
import { getUserUsage, checkUsageLimit } from '../services/usageService';
import type { UserProfile } from '../types';
import AuthModal from './AuthModal';
import UserPortalModal from './UserPortalModal';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'home' }) => {
  const [user, setUser] = useState<{ profile: UserProfile, isPro: boolean } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [usage, setUsage] = useState<{ remaining: number; limit: number; tier: string } | null>(null);

  useEffect(() => {
    // Load user on mount
    loadUser();
    loadUsage();
    
    // Listen for auth changes (e.g., after sign in/out)
    const interval = setInterval(() => {
      loadUser();
      loadUsage();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadUsage = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      const usageCheck = await checkUsageLimit();
      setUsage({
        remaining: usageCheck.remaining,
        limit: usageCheck.limit,
        tier: usageCheck.tier,
      });
    } else {
      setUsage(null);
    }
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

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  return (
    <header className="bg-slate-900/60 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <LogoIcon className="h-8 w-auto cursor-pointer" onClick={() => onNavigate?.('home')} />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate?.('pricing')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'pricing' 
                    ? 'text-cyan-400' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Pricing Plans
              </button>
              <button
                onClick={() => onNavigate?.('howto')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'howto' 
                    ? 'text-cyan-400' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                How to Use
              </button>
              <button
                onClick={() => onNavigate?.('faq')}
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'faq' 
                    ? 'text-cyan-400' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                FAQ
              </button>
            </nav>
          </div>
        
          <div className="flex items-center gap-4">
          {user ? (
            <>
              {usage && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                  <span className="text-xs text-slate-400">Credits:</span>
                  <span className={`text-sm font-semibold ${usage.remaining <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {usage.remaining === Infinity ? '∞' : usage.remaining}
                  </span>
                  <span className="text-xs text-slate-500">/ {usage.limit === Infinity ? '∞' : usage.limit}</span>
                </div>
              )}
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
            <>
              <button
                onClick={handleSignInClick}
                className="px-4 py-2 text-slate-300 hover:text-white font-semibold transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUpClick}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
              >
                Sign Up
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-slate-300 hover:text-white"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <nav className="md:hidden mt-4 pb-4 border-t border-slate-700 pt-4 space-y-3">
            <button
              onClick={() => {
                onNavigate?.('pricing');
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'pricing' 
                  ? 'bg-cyan-600/20 text-cyan-400' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Pricing Plans
            </button>
            <button
              onClick={() => {
                onNavigate?.('howto');
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'howto' 
                  ? 'bg-cyan-600/20 text-cyan-400' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              How to Use
            </button>
            <button
              onClick={() => {
                onNavigate?.('faq');
                setShowMobileMenu(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'faq' 
                  ? 'bg-cyan-600/20 text-cyan-400' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              FAQ
            </button>
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
          initialTab={authMode}
        />
      )}

      {/* User Portal Modal */}
      {showUserPortal && user && (
        <UserPortalModal
          onClose={() => {
            setShowUserPortal(false);
            loadUsage(); // Refresh usage after closing
          }}
          userProfile={user.profile}
          isProUser={user.isPro}
          generationsLeft={usage?.remaining ?? 0}
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