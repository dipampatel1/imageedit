import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

// Initialize Supabase client for server-side operations
const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  // Support both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_KEY (for self-hosted)
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase configuration missing:', {
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey: !!supabaseServiceRoleKey,
      checkedKeys: ['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_KEY'],
    });
    return null;
  }
  
  // Log key info for debugging (without exposing the full key)
  console.log('Supabase config:', {
    url: supabaseUrl,
    keyLength: supabaseServiceRoleKey?.length || 0,
    keyPrefix: supabaseServiceRoleKey?.substring(0, 20) || 'none',
    keySource: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_KEY',
  });
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Initialize a new user in the user_usage table
 * Called after successful sign up to create the user record
 */
export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('user-init function called');
    console.log('Event body:', event.body);
    
    const { userId, email, name } = JSON.parse(event.body || '{}');
    
    console.log('Parsed data:', { userId, email, name });
    
    if (!userId || !email) {
      console.error('Missing required fields:', { userId: !!userId, email: !!email });
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User ID and email are required', received: { userId: !!userId, email: !!email } }),
      };
    }
    
    // Check Supabase configuration
    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase client not available');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }),
      };
    }

    // Check if user already exists
    console.log('Checking if user exists:', userId);
    const { data: existing, error: checkError } = await supabase
      .from('user_usage')
      .select('user_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        // PGRST116 = no rows returned (this is expected for new users)
        console.log('User does not exist (expected for new sign-ups)');
      } else {
        console.error('Error checking existing user:', {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details,
          hint: checkError.hint,
        });
        // If it's an auth error, provide helpful message
        if (checkError.message?.includes('authentication') || checkError.message?.includes('Invalid')) {
          console.error('⚠️ Authentication error - check your API key. For self-hosted Supabase, you may need the service_role key, not the anon key.');
        }
      }
    }

    console.log('Existing user check result:', existing ? 'exists' : 'not found');

    if (existing) {
      // User already exists, return existing record
      console.log('User already exists, returning existing record');
      const { data: user, error: fetchError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing user:', fetchError);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: fetchError.message }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user || null),
      };
    }

    // Create new user record
    console.log('Creating new user record in user_usage table');
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    
    const { data: newUser, error: insertError } = await supabase
      .from('user_usage')
      .insert({
        user_id: userId,
        email: email,
        tier: 'free',
        user_level: 'user',
        images_generated: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    console.log('Insert result:', newUser);
    console.log('Insert error:', insertError);

    if (insertError) {
      console.error('Error creating user:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
      
      // Provide helpful error message for auth issues
      let errorMessage = insertError.message || 'Failed to create user record';
      if (insertError.message?.includes('authentication') || insertError.message?.includes('Invalid')) {
        errorMessage = 'Invalid API key. For self-hosted Supabase, ensure you\'re using the service_role key (not anon key) and that it has the correct permissions.';
      }
      
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: errorMessage,
          hint: 'Check that your SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY is correct and has admin permissions',
        }),
      };
    }

    if (!newUser) {
      console.error('User was not created - insert returned null');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Failed to create user record' }),
      };
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    };
  } catch (error: any) {
    console.error('Error initializing user:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};

