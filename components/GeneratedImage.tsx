
import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import type { EditedImage } from '../types';
import { base64ToBlob } from '../services/blobUtils';

// Let TypeScript know that JSZip is available on the window object from the CDN
declare const JSZip: any;

interface GeneratedImageProps {
  editedImages: EditedImage[];
  isLoading: boolean;
  error: string | null;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ editedImages, isLoading, error }) => {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const newImageUrls: Record<string, string> = {};
    editedImages.forEach(image => {
        const blob = base64ToBlob(image.base64, image.mimeType);
        newImageUrls[image.id] = URL.createObjectURL(blob);
    });
    setImageUrls(newImageUrls);

    // Cleanup function to revoke object URLs and prevent memory leaks
    return () => {
      Object.values(newImageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [editedImages]);

  const downloadSingleImage = () => {
    if (editedImages.length === 1 && imageUrls[editedImages[0].id]) {
      const link = document.createElement('a');
      link.href = imageUrls[editedImages[0].id];
      link.download = `edited-${editedImages[0].originalName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAsZip = async () => {
    if (typeof JSZip === 'undefined') {
        alert('Could not create ZIP file. JSZip library is missing.');
        console.error("JSZip library not found.");
        return;
    }

    const zip = new JSZip();
    editedImages.forEach((image) => {
        const filename = `edited-${image.originalName}`;
        zip.file(filename, image.base64, { base64: true });
    });

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'edited-images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (err) {
        console.error("Failed to generate zip file:", err);
        alert("An error occurred while creating the ZIP file.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5" />
        Result
      </h2>
      <div className="flex-grow flex items-center justify-center bg-black/20 rounded-lg p-4 min-h-[300px] md:min-h-[400px]">
        {isLoading && (
          <div className="text-center text-slate-400">
            <svg className="animate-spin mx-auto h-10 w-10 text-cyan-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-semibold">AI is working its magic...</p>
            <p className="text-sm">This may take a moment.</p>
          </div>
        )}
        {error && (
          <div className="text-center bg-red-900/50 p-4 rounded-lg border border-red-700">
            <p className="font-bold text-red-400 mb-2">Error</p>
            <p className="text-sm text-red-300 mb-3">{error}</p>
            {error.includes('quota') && (
              <div className="mt-3 pt-3 border-t border-red-700">
                <p className="text-xs text-red-400 mb-2">To resolve this issue:</p>
                <ol className="text-xs text-red-300 text-left list-decimal list-inside space-y-1 max-w-md mx-auto">
                  <li>Go to <a href="https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-200">Google Cloud Console</a></li>
                  <li>Check your Gemini API usage and quotas</li>
                  <li>Request a quota increase if needed</li>
                  <li>Wait for quota to reset (usually daily/monthly)</li>
                </ol>
              </div>
            )}
          </div>
        )}
        {!isLoading && !error && editedImages.length > 0 && (
           <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[500px]">
             {editedImages.map(image => (
                <div key={image.id} className="relative group aspect-square">
                    {imageUrls[image.id] && (
                        <img 
                            src={imageUrls[image.id]}
                            alt={`Generated result for ${image.originalName}`}
                            className="w-full h-full object-contain rounded-lg"
                        />
                    )}
                </div>
             ))}
           </div>
        )}
        {!isLoading && !error && editedImages.length === 0 && (
          <div className="text-center text-slate-500">
            <p>Your edited images will appear here.</p>
          </div>
        )}
      </div>
      {editedImages.length > 0 && !isLoading && (
        <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {editedImages.length > 1 ? (
                 <button
                    onClick={downloadAsZip}
                    className="flex-grow flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Download All as ZIP
                  </button>
              ) : (
                 <button
                    onClick={downloadSingleImage}
                    className="flex-grow flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    Download PNG
                  </button>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage;