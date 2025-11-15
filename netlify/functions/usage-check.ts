import { neon } from '@neondatabase/serverless';
import type { Handler } from '@netlify/functions';

const sql = neon(process.env.DATABASE_URL!);

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

    const result = await sql`
      SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    if (result.length === 0) {
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

    const usage = result[0];
    const now = new Date();
    const periodEnd = new Date(usage.current_period_end);

    // Check if period has expired
    if (now > periodEnd) {
      // Period expired, reset usage
      await sql`
        UPDATE user_usage
        SET images_generated = 0,
            current_period_start = CURRENT_TIMESTAMP,
            current_period_end = CURRENT_TIMESTAMP + INTERVAL '1 month'
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

