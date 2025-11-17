import { neon } from '@neondatabase/serverless';
import type { Handler } from '@netlify/functions';

// Initialize Neon database client
const getNeonClient = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set in environment variables');
    return null;
  }
  
  return neon(databaseUrl);
};

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
    
    // Check Neon configuration
    const sql = getNeonClient();
    if (!sql) {
      console.error('Neon client not available');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured. Check DATABASE_URL.' }),
      };
    }

    // Check if user already exists
    console.log('Checking if user exists:', userId);
    const existing = await sql`
      SELECT user_id 
      FROM user_usage 
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    console.log('Existing user check result:', existing.length > 0 ? 'exists' : 'not found');

    if (existing.length > 0) {
      // User already exists, return existing record
      console.log('User already exists, returning existing record');
      const [user] = await sql`
        SELECT * 
        FROM user_usage 
        WHERE user_id = ${userId}
        LIMIT 1
      `;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user || null),
      };
    }

    // Create new user record
    console.log('Creating new user record in user_usage table');
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    
    const [newUser] = await sql`
      INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
      VALUES (${userId}, ${email}, 'free', 'user', 0, ${new Date().toISOString()}, ${periodEnd.toISOString()})
      RETURNING *
    `;

    console.log('Insert result:', newUser);

    if (!newUser) {
      console.error('User was not created - insert returned null');
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
      body: JSON.stringify(newUser),
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
