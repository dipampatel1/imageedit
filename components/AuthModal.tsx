
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
            // Sign up the user (creates in Neon Auth or localStorage)
            const user = await authService.signUp(name, email, password);
            
            // Initialize user in database (create user_usage record)
            console.log('User signed up, attempting to initialize in database:', user);
            
            if (user.userId && user.profile.email) {
                console.log('Using Neon Auth userId:', user.userId);
                try {
                    const result = await initializeUser(user.userId, user.profile.email, user.profile.name);
                    if (result) {
                        console.log('User successfully initialized in database');
                    } else {
                        console.warn('User initialization returned null - check console for errors');
                    }
                } catch (initError) {
                    console.error('Failed to initialize user in database:', initError);
                    // Don't fail sign up if initialization fails - record will be created lazily
                }
            } else if (user.profile.email) {
                // For localStorage fallback, generate userId from email
                console.log('No userId from auth, generating from email');
                const encoder = new TextEncoder();
                const data = encoder.encode(user.profile.email);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const userId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
                
                console.log('Generated userId from email:', userId);
                try {
                    const result = await initializeUser(userId, user.profile.email, user.profile.name);
                    if (result) {
                        console.log('User successfully initialized in database');
                    } else {
                        console.warn('User initialization returned null - check console for errors');
                    }
                } catch (initError) {
                    console.error('Failed to initialize user in database:', initError);
                }
            } else {
                console.warn('Cannot initialize user - missing userId and email');
            }
            
            onAuthSuccess(); // Automatically sign in after successful sign-up
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
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
