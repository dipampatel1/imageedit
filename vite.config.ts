import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Check multiple possible env var names (API_KEY, GEMINI_API_KEY, VITE_GEMINI_API_KEY)
    const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || env.VITE_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Keep these for backward compatibility
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        // Expose Vite env vars for client-side access
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_NETLIFY_FUNCTIONS_URL': JSON.stringify(env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
