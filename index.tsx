import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Get Stack Auth project ID and publishable key
const projectId = import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || '';
const publishableClientKey = import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '';

// Debug: Log raw values (first few characters only for security)
console.log('🔵 Stack Auth Environment Check:');
console.log('  NEXT_PUBLIC_STACK_PROJECT_ID:', import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('  VITE_STACK_PROJECT_ID:', import.meta.env.VITE_STACK_PROJECT_ID ? 'SET' : 'NOT SET');
console.log('  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:', import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ? 'SET' : 'NOT SET');
console.log('  VITE_STACK_PUBLISHABLE_CLIENT_KEY:', import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY ? 'SET' : 'NOT SET');
console.log('  Resolved projectId length:', projectId ? projectId.length : 0);
console.log('  Resolved publishableClientKey length:', publishableClientKey ? publishableClientKey.length : 0);

// Check if Stack Auth is properly configured (must be non-empty strings)
const isStackAuthConfigured = 
  projectId && 
  publishableClientKey && 
  typeof projectId === 'string' && 
  typeof publishableClientKey === 'string' &&
  projectId.trim().length > 0 && 
  publishableClientKey.trim().length > 0 &&
  !projectId.startsWith('undefined') &&
  !publishableClientKey.startsWith('undefined');

console.log('  Stack Auth configured:', isStackAuthConfigured);

// Warn if Stack Auth credentials are missing
if (!isStackAuthConfigured) {
  console.warn('⚠️ Stack Auth credentials are missing or invalid!');
  console.warn('⚠️ Users will be created in public schema instead of neon_auth schema.');
  console.warn('⚠️ To fix:');
  console.warn('   1. Provision Neon Auth in Neon Console');
  console.warn('   2. Add NEXT_PUBLIC_STACK_PROJECT_ID to Netlify environment variables');
  console.warn('   3. Add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY to Netlify environment variables');
  console.warn('   4. Make sure values are NOT empty strings');
  console.warn('   5. Redeploy your site');
} else {
  console.log('✅ Stack Auth is properly configured');
}

const root = ReactDOM.createRoot(rootElement);

// Render app immediately - Stack Auth will be loaded dynamically if needed
// This ensures the app always renders, even if Stack Auth fails to load
if (isStackAuthConfigured) {
  // Try to load Stack Auth, but don't block rendering
  import('@stackframe/stack')
    .then(({ StackProvider, StackTheme }) => {
      root.render(
        <React.StrictMode>
          <StackProvider projectId={projectId} publishableClientKey={publishableClientKey}>
            <StackTheme>
              <App />
            </StackTheme>
          </StackProvider>
        </React.StrictMode>
      );
    })
    .catch((error) => {
      console.error('❌ Error loading Stack Auth, rendering app without it:', error);
      // Fallback: Render app without Stack Auth
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
} else {
  // Render app without Stack Auth (will use localStorage)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
