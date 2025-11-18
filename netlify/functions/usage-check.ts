import { neon } from '@netlify/neon';
import type { Handler } from '@netlify/functions';

// Initialize Neon database client
// @netlify/neon automatically uses NETLIFY_DATABASE_URL environment variable
// Falls back to DATABASE_URL for backward compatibility
const getNeonClient = () => {
  try {
    return neon(); // Automatically uses NETLIFY_DATABASE_URL or DATABASE_URL
  } catch (error) {
    console.error('Failed to initialize Neon client:', error);
    return null;
  }
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

    const sql = getNeonClient();
    if (!sql) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured', canGenerate: false }),
      };
    }

    const usage = await sql`
      SELECT * 
      FROM user_usage 
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (usage.length === 0) {
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

    const userUsage = usage[0];
    const now = new Date();
    const periodEnd = new Date(userUsage.current_period_end);

    // Check if period has expired
    if (now > periodEnd) {
      // Period expired, reset usage
      const newPeriodEnd = new Date();
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      await sql`
        UPDATE user_usage
        SET 
          images_generated = 0,
          current_period_start = ${new Date().toISOString()},
          current_period_end = ${newPeriodEnd.toISOString()}
        WHERE user_id = ${userId}
      `;
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canGenerate: true,
          tier: userUsage.tier,
          imagesGenerated: 0,
          limit: TIER_LIMITS[userUsage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free,
          remaining: TIER_LIMITS[userUsage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free,
        }),
      };
    }

    const limit = TIER_LIMITS[userUsage.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
    const remaining = Math.max(0, limit - userUsage.images_generated);
    const canGenerate = remaining > 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        canGenerate,
        tier: userUsage.tier,
        imagesGenerated: userUsage.images_generated,
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
