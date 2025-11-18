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
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const offset = parseInt(event.queryStringParameters?.offset || '0');
    
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
      SELECT id, image_id, base64_data, mime_type, original_name, prompt, mode, created_at
      FROM image_history
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result || []),
    };
  } catch (error: any) {
    console.error('Error fetching images:', error);
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
