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

    // Check if period has expired and reset if needed
    const currentUsage = await sql`
      SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    if (currentUsage.length === 0) {
      // Create new usage record
      await sql`
        INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
        VALUES (${userId}, ${email || 'unknown@example.com'}, 'free', 'user', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month')
        ON CONFLICT (user_id) DO UPDATE SET 
          images_generated = user_usage.images_generated + 1,
          email = EXCLUDED.email
      `;
    } else {
      const usage = currentUsage[0];
      const now = new Date();
      const periodEnd = new Date(usage.current_period_end);

      if (now > periodEnd) {
        // Reset period
        await sql`
          UPDATE user_usage
          SET images_generated = 1,
              current_period_start = CURRENT_TIMESTAMP,
              current_period_end = CURRENT_TIMESTAMP + INTERVAL '1 month'
          WHERE user_id = ${userId}
        `;
      } else {
        // Increment usage
        await sql`
          UPDATE user_usage
          SET images_generated = images_generated + 1
          WHERE user_id = ${userId}
        `;
      }
    }

    // Return updated usage
    const updated = await sql`
      SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updated[0] || null),
    };
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

