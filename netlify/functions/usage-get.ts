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

    const sql = getNeonClient();
    if (!sql) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured' }),
      };
    }

    const result = await sql`
      SELECT id, user_id, email, tier, user_level, images_generated, current_period_start, current_period_end, created_at, updated_at
      FROM user_usage
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.length === 0) {
      // Create new usage record for user
      const email = event.queryStringParameters?.email || 'unknown@example.com';
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      const [newResult] = await sql`
        INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
        VALUES (${userId}, ${email}, 'free', 'user', 0, ${new Date().toISOString()}, ${periodEnd.toISOString()})
        RETURNING *
      `;

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
