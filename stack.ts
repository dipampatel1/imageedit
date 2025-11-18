// Lazy load Stack Auth to avoid errors when not configured
let stackServerAppInstance: any = null;

export async function getStackServerApp() {
  if (stackServerAppInstance) {
    return stackServerAppInstance;
  }

  try {
    const { StackServerApp } = await import('@stackframe/stack');
    
    // Get Stack Auth credentials from environment variables
    const projectId = typeof window !== 'undefined' 
      ? (import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || '')
      : (process.env.NEXT_PUBLIC_STACK_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID || '');

    const publishableClientKey = typeof window !== 'undefined'
      ? (import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '')
      : (process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '');

    const secretServerKey = typeof window !== 'undefined'
      ? undefined // Never expose server key to client
      : (process.env.STACK_SECRET_SERVER_KEY || '');

    // Only create instance if credentials are provided
    if (projectId && publishableClientKey) {
      stackServerAppInstance = new StackServerApp({
        projectId,
        publishableClientKey,
        secretServerKey: secretServerKey || undefined,
        tokenStore: 'cookie',
        urls: {
          signIn: '/handler/sign-in',
          signUp: '/handler/sign-up',
          afterSignIn: '/',
          afterSignOut: '/',
          afterSignUp: '/',
        },
      });
    }
    
    return stackServerAppInstance;
  } catch (error) {
    console.warn('⚠️ Failed to load Stack Auth:', error);
    return null;
  }
}

// For backward compatibility, export a getter
export const stackServerApp = {
  signUpWithCredential: async (...args: any[]) => {
    const app = await getStackServerApp();
    if (!app) throw new Error('Stack Auth is not configured');
    return app.signUpWithCredential(...args);
  },
  signInWithCredential: async (...args: any[]) => {
    const app = await getStackServerApp();
    if (!app) throw new Error('Stack Auth is not configured');
    return app.signInWithCredential(...args);
  },
  signOut: async () => {
    const app = await getStackServerApp();
    if (app) return app.signOut();
  },
  getUser: async () => {
    const app = await getStackServerApp();
    if (!app) return null;
    return app.getUser();
  },
  getUserByEmail: async (email: string) => {
    const app = await getStackServerApp();
    if (!app) return null;
    return app.getUserByEmail(email);
  },
  updateUserPassword: async (userId: string, newPassword: string) => {
    const app = await getStackServerApp();
    if (!app) throw new Error('Stack Auth is not configured');
    return app.updateUserPassword(userId, newPassword);
  },
};

