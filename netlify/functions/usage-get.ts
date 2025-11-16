import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

// Initialize Supabase client for server-side operations
const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase configuration missing');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const userId = event.queryStringParameters?.userId || event.headers['x-user-id'];
    
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured' }),
      };
    }

    const { data: result, error } = await supabase
      .from('user_usage')
      .select('id, user_id, email, tier, user_level, images_generated, current_period_start, current_period_end, created_at, updated_at')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching usage:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: error.message || 'Internal server error' }),
      };
    }

    if (!result) {
      // Create new usage record for user
      const email = event.queryStringParameters?.email || 'unknown@example.com';
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      const { data: newResult, error: insertError } = await supabase
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

      if (insertError) {
        console.error('Error creating usage record:', insertError);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: insertError.message || 'Internal server error' }),
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResult || null),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result || null),
    };
  } catch (error: any) {
    console.error('Error fetching usage:', error);
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
