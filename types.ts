export interface ImageFile {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
}

export interface EditedImage {
  id: string; // Corresponds to the original ImageFile id
  base64: string; // Raw base64 data
  mimeType: string; // e.g., 'image/png'
  originalName: string;
  prompt?: string; // Optional prompt used for generation
  mode?: 'edit' | 'generate'; // Optional mode
  createdAt?: string; // Optional creation timestamp
}

// Fix: Add and export the UserProfile interface to resolve import errors across the application.
export interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}
