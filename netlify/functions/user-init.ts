import { neon } from '@netlify/neon';
import type { Handler } from '@netlify/functions';

// Initialize Neon database client
// @netlify/neon automatically uses NETLIFY_DATABASE_URL environment variable
// Falls back to DATABASE_URL for backward compatibility
const getNeonClient = () => {
  // @netlify/neon automatically uses NETLIFY_DATABASE_URL
  // If not set, it will use DATABASE_URL as fallback
  try {
    return neon(); // Automatically uses NETLIFY_DATABASE_URL or DATABASE_URL
  } catch (error) {
    console.error('Failed to initialize Neon client:', error);
    return null;
  }
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
    
    // IMPORTANT: Check if this is a Stack Auth user ID (should start with specific pattern)
    // If userId looks like a localStorage UUID (not from Stack Auth), warn but allow
    // Stack Auth user IDs typically have a specific format
    const isStackAuthUserId = userId.length > 20 && !userId.includes('-'); // Stack Auth IDs are usually longer and don't have dashes
    const isLocalStorageUserId = userId.includes('-') && userId.length === 36; // UUID format
    
    if (isLocalStorageUserId) {
      console.warn('⚠️ WARNING: User ID appears to be from localStorage (not Stack Auth)');
      console.warn('⚠️ This user will be created in public.user_usage, not neon_auth.users_sync');
      console.warn('⚠️ Stack Auth is likely not configured. Please provision Neon Auth.');
      console.warn('⚠️ See PROVISION_NEON_AUTH.md for setup instructions.');
    } else {
      console.log('✅ User ID appears to be from Stack Auth (neon_auth schema)');
    }
    
    // Check Neon configuration
    const sql = getNeonClient();
    if (!sql) {
      console.error('Neon client not available - NETLIFY_DATABASE_URL or DATABASE_URL is missing');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Database connection not configured. Check NETLIFY_DATABASE_URL or DATABASE_URL.' }),
      };
    }
    
    console.log('Neon client initialized successfully');

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
    
    const periodStart = new Date().toISOString();
    const periodEndStr = periodEnd.toISOString();
    
    console.log('Inserting user with data:', {
      userId,
      email,
      tier: 'free',
      user_level: 'user',
      images_generated: 0,
      current_period_start: periodStart,
      current_period_end: periodEndStr,
    });
    
    const result = await sql`
      INSERT INTO user_usage (user_id, email, tier, user_level, images_generated, current_period_start, current_period_end)
      VALUES (${userId}, ${email}, 'free', 'user', 0, ${periodStart}, ${periodEndStr})
      RETURNING *
    `;

    console.log('Insert result:', result);
    console.log('Insert result length:', result.length);
    const newUser = result[0];
    console.log('Extracted newUser:', newUser);

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
