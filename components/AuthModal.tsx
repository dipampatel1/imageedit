
import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import * as authService from '../services/authService';
import { initializeUser } from '../services/userService';

interface AuthModalProps {
    onClose: () => void;
    onAuthSuccess: () => void;
    initialTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess, initialTab = 'signin' }) => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
    
    // Update tab when initialTab prop changes
    React.useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }
        
        setIsLoading(true);

        try {
            // Sign up the user (creates in localStorage)
            const user = await authService.signUp(name, email, password);
            
            // Initialize user in database (create user_usage record)
            let initSuccess = false;
            let initError: string | null = null;
            
            if (user.userId && user.profile.email) {
                try {
                    const result = await initializeUser(user.userId, user.profile.email, user.profile.name);
                    // Check for both user_id and userId (case variations)
                    if (result && (result.user_id || result.userId)) {
                        initSuccess = true;
                    } else {
                        initError = 'User initialization returned invalid result - check Netlify function logs';
                        console.error('User initialization failed:', result);
                    }
                } catch (initErrorObj) {
                    initError = `Failed to initialize user: ${initErrorObj instanceof Error ? initErrorObj.message : 'Unknown error'}`;
                    console.error('Failed to initialize user in database:', initErrorObj);
                }
            } else if (user.profile.email) {
                // For localStorage fallback, generate userId from email
                const encoder = new TextEncoder();
                const data = encoder.encode(user.profile.email);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
                
                try {
                    const result = await initializeUser(userId, user.profile.email, user.profile.name);
                    // Check for both user_id and userId (case variations)
                    if (result && (result.user_id || result.userId)) {
                        initSuccess = true;
                    } else {
                        initError = 'User initialization returned invalid result - check Netlify function logs';
                        console.error('User initialization failed:', result);
                    }
                } catch (initErrorObj) {
                    initError = `Failed to initialize user: ${initErrorObj instanceof Error ? initErrorObj.message : 'Unknown error'}`;
                    console.error('Failed to initialize user in database:', initErrorObj);
                }
            } else {
                initError = 'Cannot initialize user - missing userId and email';
            }
            
            // Show warning if database initialization failed (but don't block sign up)
            if (!initSuccess) {
                console.warn('Database initialization failed:', initError);
                setError(`Account created! ⚠️ Database initialization failed: ${initError || 'Unknown error'}. Check Netlify function logs.`);
            }
            
            onAuthSuccess(); // Automatically sign in after successful sign-up
        } catch (err) {
            console.error('❌ Sign up error caught:', err);
            console.error('Error type:', typeof err);
            console.error('Error details:', {
                message: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
                name: err instanceof Error ? err.name : undefined,
            });
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            console.error('Setting error message:', errorMessage);
            setError(errorMessage);
            // Make sure error is visible
            setTimeout(() => {
                const errorDiv = document.querySelector('.bg-red-900\\/50');
                if (errorDiv) {
                    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        } finally {
            console.log('🔵 Setting isLoading to false');
            setIsLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
        setIsLoading(true);

        try {
            await authService.signIn(email, password);
            onAuthSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderForm = () => {
        if (activeTab === 'signup') {
            return (
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="name">Full Name</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email-signup">Email Address</label>
                        <input id="email-signup" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password-signup">Password</label>
                        <input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email-signin">Email Address</label>
                    <input id="email-signin" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password-signin">Password</label>
                    <input id="password-signin" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                </div>
                 <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-sm m-4 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10" aria-label="Close auth modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-8">
                    <div className="text-center mb-6">
                        <LogoIcon className="h-8 w-auto mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">
                            {activeTab === 'signin' ? 'Welcome Back' : 'Create an Account'}
                        </h2>
                    </div>
                    <div className="flex border-b border-slate-700 mb-6">
                        <button onClick={() => setActiveTab('signin')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'signin' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                            Sign In
                        </button>
                        <button onClick={() => setActiveTab('signup')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'signup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                            Sign Up
                        </button>
                    </div>

                    {error && <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

                    {renderForm()}
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
        </div>
    );
};

export default AuthModal;
