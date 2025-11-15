import * as authService from './authService';
import type { EditedImage } from '../types';

const FUNCTIONS_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';

export interface SavedImage {
  id: number;
  image_id: string;
  base64_data: string;
  mime_type: string;
  original_name: string | null;
  prompt: string | null;
  mode: string | null;
  created_at: string;
}

const getUserId = async (): Promise<string | null> => {
  const user = await authService.getCurrentUser();
  if (!user) return null;
  
  if (user.profile.email) {
    const encoder = new TextEncoder();
    const data = encoder.encode(user.profile.email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }
  return null;
};

export const saveImage = async (
  image: EditedImage,
  prompt?: string,
  mode?: 'edit' | 'generate'
): Promise<boolean> => {
  const userId = await getUserId();
  if (!userId) return false;

  try {
    const response = await fetch(`${FUNCTIONS_URL}/images-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        imageId: image.id,
        base64Data: image.base64,
        mimeType: image.mimeType,
        originalName: image.originalName,
        prompt: prompt || null,
        mode: mode || null,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save image');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving image:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`images_${userId}`);
    const images = stored ? JSON.parse(stored) : [];
    images.push({
      ...image,
      prompt,
      mode,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(`images_${userId}`, JSON.stringify(images));
    return true;
  }
};

export const getImageHistory = async (limit: number = 50, offset: number = 0): Promise<SavedImage[]> => {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const response = await fetch(`${FUNCTIONS_URL}/images-get?userId=${userId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching images:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`images_${userId}`);
    const images = stored ? JSON.parse(stored) : [];
    return images.slice(offset, offset + limit).map((img: any) => ({
      id: img.id || 0,
      image_id: img.id || img.image_id,
      base64_data: img.base64 || img.base64_data,
      mime_type: img.mimeType || img.mime_type,
      original_name: img.originalName || img.original_name,
      prompt: img.prompt,
      mode: img.mode,
      created_at: img.createdAt || img.created_at,
    }));
  }
};

export const deleteImage = async (imageId: string): Promise<boolean> => {
  const userId = await getUserId();
  if (!userId) return false;

  try {
    const response = await fetch(`${FUNCTIONS_URL}/images-delete?userId=${userId}&imageId=${imageId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem(`images_${userId}`);
    const images = stored ? JSON.parse(stored) : [];
    const filtered = images.filter((img: any) => img.id !== imageId);
    localStorage.setItem(`images_${userId}`, JSON.stringify(filtered));
    return true;
  }
};

