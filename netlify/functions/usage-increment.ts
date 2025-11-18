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
    const { userId, email } = JSON.parse(event.body || '{}');
    
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

    // Check if period has expired and reset if needed
    const currentUsage = await sql`
      SELECT * 
      FROM user_usage 
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (currentUsage.length === 0) {
      // Create new usage record
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      const [newUsage] = await sql`
        INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
        VALUES (${userId}, ${email || 'unknown@example.com'}, 'free', 'user', 1, ${new Date().toISOString()}, ${periodEnd.toISOString()})
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUsage || null),
      };
    }

    const userUsage = currentUsage[0];
    const now = new Date();
    const periodEnd = new Date(userUsage.current_period_end);

    if (now > periodEnd) {
      // Reset period
      const newPeriodEnd = new Date();
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      
      const [updated] = await sql`
        UPDATE user_usage
        SET 
          images_generated = 1,
          current_period_start = ${new Date().toISOString()},
          current_period_end = ${newPeriodEnd.toISOString()}
        WHERE user_id = ${userId}
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated || null),
      };
    } else {
      // Increment usage
      const [updated] = await sql`
        UPDATE user_usage
        SET images_generated = ${userUsage.images_generated + 1}
        WHERE user_id = ${userId}
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated || null),
      };
    }
  } catch (error: any) {
    console.error('Error incrementing usage:', error);
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
