
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
    
    // Provide more detailed error messages
    if (error.message?.includes('API_KEY') || error.message?.includes('api key')) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('Gemini API quota exceeded. Please check your API usage limits.');
    }
    
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
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
    
    // Provide more detailed error messages
    if (error.message?.includes('API_KEY') || error.message?.includes('api key')) {
      throw new Error('Gemini API key is missing or invalid. Please check your environment variables.');
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('Gemini API quota exceeded. Please check your API usage limits.');
    }
    
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
  }
};
