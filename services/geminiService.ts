
import { GoogleGenAI, Modality } from '@google/genai';
import type { ImageFile } from '../types';

const model = 'gemini-2.5-flash-image';

export const editImageWithGemini = async (
  image: ImageFile,
  prompt: string
): Promise<string | null> => {
  try {
    // Initialize the GoogleGenAI client here to ensure `process.env.API_KEY` is available
    // when the function is called, rather than at module load time.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate image with Gemini. Check the console for details.');
  }
};

export const generateImageWithGemini = async (
  prompt: string
): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  } catch (error) {
    console.error('Error calling Gemini API for generation:', error);
    throw new Error('Failed to generate image with Gemini. Check the console for details.');
  }
};
