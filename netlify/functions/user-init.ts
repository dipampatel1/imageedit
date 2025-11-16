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
    
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set!');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured' }),
      };
    }

    // Check if user already exists
    console.log('Checking if user exists:', userId);
    const existing = await sql`
      SELECT user_id FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    console.log('Existing user check result:', existing.length);

    if (existing.length > 0) {
      // User already exists, return existing record
      console.log('User already exists, returning existing record');
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
    console.log('Creating new user record in user_usage table');
    const insertResult = await sql`
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
      RETURNING *
    `;
    
    console.log('Insert result:', insertResult);
    
    // Fetch the newly created record
    const newUser = await sql`
      SELECT * FROM user_usage WHERE user_id = ${userId} LIMIT 1
    `;

    console.log('Fetched new user:', newUser);

    if (newUser.length === 0) {
      console.error('User was not created - insert may have failed silently');
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

