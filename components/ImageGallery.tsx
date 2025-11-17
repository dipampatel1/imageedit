import React, { useState, useEffect } from 'react';
import { getImageHistory, deleteImage, type SavedImage } from '../services/imageHistoryService';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageGalleryProps {
  onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onClose }) => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const savedImages = await getImageHistory(50);
      setImages(savedImages);
      
      // Create object URLs for images
      const urls = new Map<number, string>();
      savedImages.forEach(img => {
        try {
          const blob = base64ToBlob(img.base64_data, img.mime_type);
          const url = URL.createObjectURL(blob);
          urls.set(img.id, url);
        } catch (err) {
          console.error('Error creating image URL:', err);
        }
      });
      setImageUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleDownload = (image: SavedImage) => {
    const url = imageUrls.get(image.id);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = image.original_name || `image-${image.image_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      await deleteImage(imageId);
      setImages(prev => prev.filter(img => img.image_id !== imageId));
      const url = imageUrls.get(parseInt(imageId));
      if (url) {
        URL.revokeObjectURL(url);
        const newUrls = new Map(imageUrls);
        newUrls.delete(parseInt(imageId));
        setImageUrls(newUrls);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] m-4 relative animate-fade-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10"
          aria-label="Close gallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Image Gallery</h2>
          <p className="text-sm text-slate-400 mt-1">Your saved images</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="text-slate-400 mt-4">Loading images...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 text-red-300 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No images saved yet.</p>
              <p className="text-sm text-slate-500 mt-2">Generate or edit images to see them here.</p>
            </div>
          )}

          {!loading && !error && images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => {
                const url = imageUrls.get(image.id);
                return (
                  <div key={image.id} className="relative group aspect-square bg-slate-900 rounded-lg overflow-hidden">
                    {url ? (
                      <img 
                        src={url} 
                        alt={image.original_name || 'Generated image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <p className="text-slate-500 text-xs">Loading...</p>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(image)}
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(image.image_id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>

                    {image.prompt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white truncate" title={image.prompt}>
                          {image.prompt}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ImageGallery;

