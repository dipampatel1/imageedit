
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
    console.error('Error calling Gemini API:', error);
    
    // Check for specific error codes and messages
    const errorMessage = error.message || error.toString() || '';
    const errorCode = error.code || error.status || '';
    
    // API key errors
    if (errorMessage.includes('API_KEY') || errorMessage.includes('api key') || errorCode === 401 || errorCode === 403) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables in Netlify.');
    }
    
    // Quota/rate limit errors
    if (errorMessage.includes('quota') || 
        errorMessage.includes('limit') || 
        errorMessage.includes('429') ||
        errorCode === 429 ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate limit')) {
      throw new Error('Gemini API quota exceeded. You have reached your API usage limit. Please check your Google Cloud Console to view usage and upgrade your quota if needed.');
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection and try again.');
    }
    
    // Generic error with more context
    throw new Error(`Failed to generate image: ${errorMessage || 'Unknown error. Please try again later.'}`);
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
    console.error('Error calling Gemini API for generation:', error);
    
    // Check for specific error codes and messages
    const errorMessage = error.message || error.toString() || '';
    const errorCode = error.code || error.status || '';
    
    // API key errors
    if (errorMessage.includes('API_KEY') || errorMessage.includes('api key') || errorCode === 401 || errorCode === 403) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables in Netlify.');
    }
    
    // Quota/rate limit errors
    if (errorMessage.includes('quota') || 
        errorMessage.includes('limit') || 
        errorMessage.includes('429') ||
        errorCode === 429 ||
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('rate limit')) {
      throw new Error('Gemini API quota exceeded. You have reached your API usage limit. Please check your Google Cloud Console to view usage and upgrade your quota if needed.');
    }
    
    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
      throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection and try again.');
    }
    
    // Generic error with more context
    throw new Error(`Failed to generate image: ${errorMessage || 'Unknown error. Please try again later.'}`);
  }
};
