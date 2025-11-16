import { neon } from '@neondatabase/serverless';
import type { Handler } from '@netlify/functions';

const sql = neon(process.env.DATABASE_URL!);

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
    const { userId, email, name } = JSON.parse(event.body || '{}');
    
    if (!userId || !email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'User ID and email are required' }),
      };
    }

    // Check if user already exists
    const existing = await sql`
      SELECT user_id FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    if (existing.length > 0) {
      // User already exists, return existing record
      const user = await sql`
        SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
      `;
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user[0] || null),
      };
    }

    // Create new user record
    await sql`
      INSERT INTO user_usage (
        user_id, 
        email, 
        tier, 
        user_level, 
        images_generated, 
        current_period_start, 
        current_period_end
      )
      VALUES (
        ${userId}, 
        ${email}, 
        'free', 
        'user', 
        0, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP + INTERVAL '1 month'
      )
      ON CONFLICT (user_id) DO NOTHING
    `;
    
    // Fetch the newly created record
    const newUser = await sql`
      SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser[0] || null),
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

