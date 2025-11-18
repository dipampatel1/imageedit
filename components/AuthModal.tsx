import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogoIcon } from './icons/LogoIcon';
import { initializeUser } from '../services/userService';

interface AuthModalProps {
    onClose: () => void;
    onAuthSuccess: () => void;
    initialTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess, initialTab = 'signin' }) => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(initialTab);
    const [mounted, setMounted] = useState(false);
    
    // Check if Stack Auth is configured
    const projectId = import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || '';
    const publishableKey = import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '';
    const isStackAuthConfigured = projectId && publishableKey && projectId.trim() !== '' && publishableKey.trim() !== '';
    
    // Try to use Stack Auth hooks - they'll only work if StackProvider is configured
    // We'll handle errors gracefully
    let user = null;
    let stackApp = null;
    
    // Dynamically import and use Stack Auth hooks only if configured
    // This avoids errors when StackProvider isn't available
    const [stackAuthReady, setStackAuthReady] = useState(false);
    const [StackAuthComponents, setStackAuthComponents] = useState<any>(null);
    
    useEffect(() => {
        if (isStackAuthConfigured) {
            // Dynamically import Stack Auth components
            import('@stackframe/stack').then((stack) => {
                try {
                    // Try to use hooks - they'll throw if StackProvider isn't available
                    // We'll handle this in the component rendering
                    setStackAuthComponents(stack);
                    setStackAuthReady(true);
                } catch (error) {
                    console.warn('⚠️ Stack Auth hooks not available:', error);
                    setStackAuthReady(false);
                }
            }).catch((error) => {
                console.warn('⚠️ Failed to load Stack Auth:', error);
                setStackAuthReady(false);
            });
        }
    }, [isStackAuthConfigured]);
    
    // Update tab when initialTab prop changes
    React.useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    // Mount check for portal
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Debug: Log Stack Auth configuration
    useEffect(() => {
        console.log('🔵 AuthModal - Stack Auth Configuration Check:');
        console.log('  Project ID:', projectId ? `${projectId.substring(0, 10)}...` : '❌ MISSING');
        console.log('  Publishable Key:', publishableKey ? `${publishableKey.substring(0, 10)}...` : '❌ MISSING');
        console.log('  Stack Auth configured:', isStackAuthConfigured);
        
        // Validate credentials are not just empty strings
        const hasValidProjectId = projectId && projectId.trim().length > 0 && projectId.trim() !== '';
        const hasValidPublishableKey = publishableKey && publishableKey.trim().length > 0 && publishableKey.trim() !== '';
        
        console.log('  Valid Project ID:', hasValidProjectId);
        console.log('  Valid Publishable Key:', hasValidPublishableKey);
        
        if (!isStackAuthConfigured || !hasValidProjectId || !hasValidPublishableKey) {
            console.error('❌ Stack Auth is NOT configured! Users will be created in public schema.');
            console.error('❌ Please follow PROVISION_NEON_AUTH.md to set up Neon Auth.');
            console.error('❌ Check that environment variables are set in Netlify and not empty.');
        } else {
            console.log('✅ Stack Auth is configured. Users should be created in neon_auth schema.');
        }
    }, [projectId, publishableKey, isStackAuthConfigured]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        setIsLoading(true);

        try {
            if (isStackAuthConfigured && StackAuthComponents) {
                // Use Stack Auth for sign-up
                const { stackServerApp } = await import('../stack');
                const result = await stackServerApp.signUpWithCredential({
                    email,
                    password,
                    displayName: name,
                });

                if (!result.user) {
                    throw new Error('Failed to create user account. Please try again.');
                }

                // Initialize user in user_usage table
                if (result.user.id && result.user.primaryEmail) {
                    await initializeUser(result.user.id, result.user.primaryEmail, result.user.displayName || name);
                }
                
                onAuthSuccess();
            } else {
                // Fallback to localStorage (for backward compatibility)
                setError("⚠️ Stack Auth is not configured. Please set up Neon Auth to enable sign-up.");
            }
        } catch (err) {
            console.error('❌ Sign up error:', err);
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
            if (isStackAuthConfigured) {
                // Use Stack Auth for sign-in
                const { stackServerApp } = await import('../stack');
                const result = await stackServerApp.signInWithCredential({
                    email,
                    password,
                });

                if (!result.user) {
                    throw new Error('Invalid email or password.');
                }
                
                onAuthSuccess();
            } else {
                // Fallback to localStorage (for backward compatibility)
                setError("⚠️ Stack Auth is not configured. Please set up Neon Auth to enable sign-in.");
            }
        } catch (err) {
            console.error('❌ Sign in error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!email) {
            setError("Email address is required.");
            return;
        }

        setIsLoading(true);

        try {
            if (isStackAuthConfigured) {
                const { stackServerApp } = await import('../stack');
                const userByEmail = await stackServerApp.getUserByEmail(email);
                
                if (!userByEmail) {
                    setError("No account found with this email address.");
                    setIsLoading(false);
                    return;
                }

                setError(null);
                setActiveTab('reset');
            } else {
                setError("⚠️ Stack Auth is not configured. Please set up Neon Auth to enable password reset.");
            }
        } catch (err) {
            console.error('❌ Error in handleForgotPassword:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !newPassword || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            if (isStackAuthConfigured) {
                const { stackServerApp } = await import('../stack');
                const userByEmail = await stackServerApp.getUserByEmail(email);
                
                if (!userByEmail) {
                    setError("No account found with this email address.");
                    setIsLoading(false);
                    return;
                }

                await stackServerApp.updateUserPassword(userByEmail.id, newPassword);
                
                setError(null);
                setActiveTab('signin');
                setNewPassword('');
                setConfirmPassword('');
                alert('Password reset successful! Please sign in with your new password.');
            } else {
                setError("⚠️ Stack Auth is not configured. Please set up Neon Auth to enable password reset.");
            }
        } catch (err) {
            console.error('❌ Error resetting password:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderForm = () => {
        if (activeTab === 'signup') {
            if (!isStackAuthConfigured) {
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-900/50 text-yellow-300 text-sm p-4 rounded-lg">
                            <p className="font-semibold mb-2">⚠️ Neon Auth Not Configured</p>
                            <p className="mb-2">Stack Auth credentials are missing. Users will be created in the public schema instead of neon_auth.</p>
                            <p className="text-xs mt-2">To fix this:</p>
                            <ol className="text-xs list-decimal list-inside mt-1 space-y-1">
                                <li>Provision Neon Auth in Neon Console</li>
                                <li>Add NEXT_PUBLIC_STACK_PROJECT_ID to Netlify</li>
                                <li>Add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY to Netlify</li>
                                <li>Redeploy your site</li>
                            </ol>
                            <p className="text-xs mt-2">
                                See <code className="bg-yellow-800/50 px-1 rounded">PROVISION_NEON_AUTH.md</code> for details.
                            </p>
                        </div>
                        <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-lg">
                            <p>⚠️ Sign up is disabled until Neon Auth is configured.</p>
                        </div>
                    </div>
                );
            }
            
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
                        <input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                        <p className="text-xs text-slate-400 mt-1">Password must be at least 6 characters</p>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            );
        }

        if (activeTab === 'forgot') {
            return (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-slate-400 mb-4">
                        Enter your email address and we'll help you reset your password.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email-forgot">Email Address</label>
                        <input id="email-forgot" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Checking...' : 'Continue'}
                    </button>
                    <button type="button" onClick={() => setActiveTab('signin')} className="w-full text-slate-400 hover:text-white text-sm mt-2">
                        Back to Sign In
                    </button>
                </form>
            );
        }

        if (activeTab === 'reset') {
            return (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-slate-400 mb-4">
                        Enter your new password below.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email-reset">Email Address</label>
                        <input id="email-reset" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="new-password">New Password</label>
                        <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                        <p className="text-xs text-slate-400 mt-1">Password must be at least 6 characters</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="confirm-password">Confirm New Password</label>
                        <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                    <button type="button" onClick={() => setActiveTab('signin')} className="w-full text-slate-400 hover:text-white text-sm mt-2">
                        Back to Sign In
                    </button>
                </form>
            );
        }

        if (!isStackAuthConfigured) {
            return (
                <div className="space-y-4">
                    <div className="bg-yellow-900/50 text-yellow-300 text-sm p-4 rounded-lg">
                        <p className="font-semibold mb-2">⚠️ Neon Auth Not Configured</p>
                        <p className="mb-2">Stack Auth credentials are missing. Please configure Neon Auth to enable sign in.</p>
                        <p className="text-xs mt-2">
                            See <code className="bg-yellow-800/50 px-1 rounded">PROVISION_NEON_AUTH.md</code> for setup instructions.
                        </p>
                    </div>
                </div>
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
                <div className="text-right">
                    <button 
                        type="button" 
                        onClick={() => {
                            setActiveTab('forgot');
                            setError(null);
                        }} 
                        className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                        Forgot Password?
                    </button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-600">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        );
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto" style={{ position: 'fixed', zIndex: 9999 }} onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] my-auto relative animate-fade-in-up overflow-y-auto" style={{ position: 'relative', zIndex: 10000 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10" aria-label="Close auth modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-8">
                    <div className="text-center mb-6">
                        <LogoIcon className="h-8 w-auto mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">
                            {activeTab === 'signin' ? 'Welcome Back' : 
                             activeTab === 'signup' ? 'Create an Account' :
                             activeTab === 'forgot' ? 'Forgot Password' :
                             'Reset Password'}
                        </h2>
                    </div>
                    {(activeTab === 'signin' || activeTab === 'signup') && (
                        <div className="flex border-b border-slate-700 mb-6">
                            <button onClick={() => setActiveTab('signin')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'signin' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                Sign In
                            </button>
                            <button onClick={() => setActiveTab('signup')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'signup' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                                Sign Up
                            </button>
                        </div>
                    )}
                    {activeTab === 'forgot' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Reset Password</h3>
                        </div>
                    )}
                    {activeTab === 'reset' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white">Set New Password</h3>
                        </div>
                    )}

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

    if (!mounted) return null;

    // Render modal using portal at document body level to avoid z-index issues
    return createPortal(modalContent, document.body);
};

export default AuthModal;
