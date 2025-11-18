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
    const { userId, imageId, base64Data, mimeType, originalName, prompt, mode } = JSON.parse(event.body || '{}');
    
    if (!userId || !imageId || !base64Data) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'userId, imageId, and base64Data are required' }),
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

    await sql`
      INSERT INTO image_history (user_id, image_id, base64_data, mime_type, original_name, prompt, mode)
      VALUES (${userId}, ${imageId}, ${base64Data}, ${mimeType || 'image/png'}, ${originalName || null}, ${prompt || null}, ${mode || null})
    `;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, imageId }),
    };
  } catch (error: any) {
    console.error('Error saving image:', error);
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
