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

/**
 * Check if an email exists in the user_usage table
 */
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

  if (event.httpMethod !== 'GET') {
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
    const email = event.queryStringParameters?.email;
    
    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Email parameter is required' }),
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
        body: JSON.stringify({ error: 'Database connection not available' }),
      };
    }

    console.log('Checking if email exists:', email);
    
    // Check if email exists in user_usage table
    const result = await sql`
      SELECT email 
      FROM user_usage 
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    const exists = result && result.length > 0;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ exists }),
    };
  } catch (error: any) {
    console.error('Error checking email:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to check email',
        details: error.message 
      }),
    };
  }
};

