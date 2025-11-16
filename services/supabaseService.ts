// Supabase client initialization
// This service provides the Supabase client for both client-side and server-side use

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Server-side Supabase client (for Netlify functions)
// Uses service role key for admin operations
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

// Client-side Supabase client (for browser)
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get Supabase client for client-side use (browser)
 * Uses anon key - respects Row Level Security (RLS) policies
 */
export const getSupabaseClient = (): ReturnType<typeof createClient> | null => {
  if (typeof window === 'undefined') {
    console.warn('getSupabaseClient called outside browser context');
    return null;
  }
  
  if (!supabaseClient) {
    console.log('🔵 Initializing Supabase client...');
    console.log('Config check:', {
      hasUrl: !!SUPABASE_URL,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      url: SUPABASE_URL?.substring(0, 50) + '...',
      keyPrefix: SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    });
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Supabase not configured - missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
      console.error('Missing:', {
        url: !SUPABASE_URL,
        anonKey: !SUPABASE_ANON_KEY,
      });
      return null;
    }
    
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      return null;
    }
  }
  
  return supabaseClient;
};

/**
 * Get Supabase admin client for server-side use (Netlify functions)
 * Uses service role key - bypasses RLS policies
 */
export const getSupabaseAdmin = (): ReturnType<typeof createClient> | null => {
  // For server-side, we need the service role key from environment
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
    return null;
  }
  
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL || SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.error('SUPABASE_URL is not set in environment variables');
      return null;
    }
    
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  return supabaseAdmin;
};

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

