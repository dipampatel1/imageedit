
import { GoogleGenAI, Modality } from '@google/genai';
import type { ImageFile } from '../types';

const model = 'gemini-2.5-flash-image';

// Get API key from Vite environment variables
const getApiKey = (): string => {
  // Try multiple possible environment variable names for compatibility
  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    import.meta.env.GEMINI_API_KEY ||
    import.meta.env.VITE_API_KEY ||
    (window as any).__GEMINI_API_KEY__; // Fallback for Netlify build-time injection
  
  if (!apiKey) {
    console.error('Available env vars:', {
      VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
      GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY,
      VITE_API_KEY: import.meta.env.VITE_API_KEY,
    });
    throw new Error('GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in your Netlify environment variables.');
  }
  
  return apiKey;
};

export const editImageWithGemini = async (
  image: ImageFile,
  prompt: string
): Promise<string | null> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const imagePart = {
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // Find the image part in the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }

    return null;

  } catch (error: any) {
    // Log full error details for debugging
    console.error('Error calling Gemini API:', {
      error,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusCode: error?.statusCode,
      response: error?.response,
      details: error?.details,
    });
    
    // Check for specific error codes and messages
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || error?.status || error?.statusCode || '';
    const errorDetails = error?.details || error?.response || {};
    
    // Log the actual API response if available
    if (error?.response) {
      console.error('Gemini API Response:', error.response);
    }
    
    // API key errors
    if (errorMessage.includes('API_KEY') || 
        errorMessage.includes('api key') || 
        errorMessage.includes('API key') ||
        errorCode === 401 || 
        errorCode === 403 ||
        errorDetails?.code === 401 ||
        errorDetails?.code === 403) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables in Netlify.');
    }
    
    // Quota/rate limit errors - check multiple indicators
    const isQuotaError = 
      errorMessage.includes('quota') || 
      errorMessage.includes('limit') || 
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('Rate limit') ||
      errorCode === 429 ||
      errorCode === '429' ||
      errorDetails?.code === 429 ||
      errorDetails?.reason === 'RATE_LIMIT_EXCEEDED' ||
      errorDetails?.reason === 'RESOURCE_EXHAUSTED';
    
    if (isQuotaError) {
      console.warn('Quota exceeded - Full error details:', error);
      throw new Error('Gemini API quota exceeded. You have reached your API usage limit. Please check your Google Cloud Console to view usage and upgrade your quota if needed.');
    }
    
    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection and try again.');
    }
    
    // Generic error with more context
    const detailedMessage = errorMessage || 
      errorDetails?.message || 
      `Error code: ${errorCode}` || 
      'Unknown error. Please try again later.';
    
    throw new Error(`Failed to generate image: ${detailedMessage}`);
  }
};

export const generateImageWithGemini = async (
  prompt: string
): Promise<string | null> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
    }

    return null;

  } catch (error: any) {
    // Log full error details for debugging
    console.error('Error calling Gemini API for generation:', {
      error,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusCode: error?.statusCode,
      response: error?.response,
      details: error?.details,
    });
    
    // Check for specific error codes and messages
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || error?.status || error?.statusCode || '';
    const errorDetails = error?.details || error?.response || {};
    
    // Log the actual API response if available
    if (error?.response) {
      console.error('Gemini API Response:', error.response);
    }
    
    // API key errors
    if (errorMessage.includes('API_KEY') || 
        errorMessage.includes('api key') || 
        errorMessage.includes('API key') ||
        errorCode === 401 || 
        errorCode === 403 ||
        errorDetails?.code === 401 ||
        errorDetails?.code === 403) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables in Netlify.');
    }
    
    // Quota/rate limit errors - check multiple indicators
    const isQuotaError = 
      errorMessage.includes('quota') || 
      errorMessage.includes('limit') || 
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('Rate limit') ||
      errorCode === 429 ||
      errorCode === '429' ||
      errorDetails?.code === 429 ||
      errorDetails?.reason === 'RATE_LIMIT_EXCEEDED' ||
      errorDetails?.reason === 'RESOURCE_EXHAUSTED';
    
    if (isQuotaError) {
      console.warn('Quota exceeded - Full error details:', error);
      throw new Error('Gemini API quota exceeded. You have reached your API usage limit. Please check your Google Cloud Console to view usage and upgrade your quota if needed.');
    }
    
    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection and try again.');
    }
    
    // Generic error with more context
    const detailedMessage = errorMessage || 
      errorDetails?.message || 
      `Error code: ${errorCode}` || 
      'Unknown error. Please try again later.';
    
    throw new Error(`Failed to generate image: ${detailedMessage}`);
  }
};
