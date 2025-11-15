import { neon } from '@neondatabase/serverless';
import type { Handler } from '@netlify/functions';

const sql = neon(process.env.DATABASE_URL!);

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

    const result = await sql`
      SELECT 
        id,
        user_id,
        email,
        tier,
        images_generated,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
      FROM user_usage
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      // Create new usage record for user
      const email = event.queryStringParameters?.email || 'unknown@example.com';
      await sql`
        INSERT INTO user_usage (user_id, email, tier, images_generated, current_period_start, current_period_end)
        VALUES (${userId}, ${email}, 'free', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month')
        ON CONFLICT (user_id) DO UPDATE SET tier = EXCLUDED.tier
      `;
      
      // Fetch the newly created record
      const newResult = await sql`
        SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
      `;
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResult[0] || null),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result[0] || null),
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

