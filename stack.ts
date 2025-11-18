import { StackServerApp } from '@stackframe/stack';

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

export const stackServerApp = new StackServerApp({
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

