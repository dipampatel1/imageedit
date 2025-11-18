import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StackProvider, StackTheme } from '@stackframe/stack';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Get Stack Auth project ID and publishable key
const projectId = import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID || import.meta.env.VITE_STACK_PROJECT_ID || '';
const publishableClientKey = import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || '';

// Warn if Stack Auth credentials are missing
if (!projectId || !publishableClientKey) {
  console.warn('⚠️ Stack Auth credentials are missing!');
  console.warn('⚠️ Users will be created in public schema instead of neon_auth schema.');
  console.warn('⚠️ To fix:');
  console.warn('   1. Provision Neon Auth in Neon Console');
  console.warn('   2. Add NEXT_PUBLIC_STACK_PROJECT_ID to Netlify environment variables');
  console.warn('   3. Add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY to Netlify environment variables');
  console.warn('   4. Redeploy your site');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {projectId && publishableClientKey ? (
      <StackProvider projectId={projectId} publishableClientKey={publishableClientKey}>
        <StackTheme>
          <App />
        </StackTheme>
      </StackProvider>
    ) : (
      // Fallback: Render app without Stack Auth (will use localStorage)
      <App />
    )}
  </React.StrictMode>
);
