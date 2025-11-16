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

// Tier limits (updated to competitive pricing model)
const TIER_LIMITS = {
  free: 25,
  starter: 200,
  pro: 1000,
  business: 5000,
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
        body: JSON.stringify({ error: 'User ID is required', canGenerate: false }),
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
        body: JSON.stringify({ error: 'Database connection not configured', canGenerate: false }),
      };
    }

    const { data: usage, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking usage:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: error.message || 'Internal server error', canGenerate: false }),
      };
    }

    if (!usage) {
      // New user, can generate
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canGenerate: true,
          tier: 'free',
          imagesGenerated: 0,
          limit: TIER_LIMITS.free,
          remaining: TIER_LIMITS.free,
        }),
      };
    }

    const now = new Date();
    const periodEnd = new Date(usage.current_period_end);

    // Check if period has expired
    if (now > periodEnd) {
      // Period expired, reset usage
      const newPeriodEnd = new Date();
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      const { error: updateError } = await supabase
        .from('user_usage')
        .update({
          images_generated: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error resetting usage period:', updateError);
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canGenerate: true,
          tier: usage.tier,
          imagesGenerated: 0,
          limit: TIER_LIMITS[usage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free,
          remaining: TIER_LIMITS[usage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free,
        }),
      };
    }

    const limit = TIER_LIMITS[usage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
    const remaining = Math.max(0, limit - usage.images_generated);
    const canGenerate = remaining > 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        canGenerate,
        tier: usage.tier,
        imagesGenerated: usage.images_generated,
        limit,
        remaining,
      }),
    };
  } catch (error: any) {
    console.error('Error checking usage:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message || 'Internal server error', canGenerate: false }),
    };
  }
};
