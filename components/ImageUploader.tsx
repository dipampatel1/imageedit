import React, { useCallback, useState, useEffect } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { base64ToBlob } from '../services/blobUtils';

interface ImageUploaderProps {
  onImagesUpload: (imageFiles: ImageFile[]) => void;
  onImageRemove: (id: string) => void;
  onClearAll: () => void;
  originalImages: ImageFile[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, onImageRemove, onClearAll, originalImages }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const newImageUrls: Record<string, string> = {};
    originalImages.forEach(image => {
        const blob = base64ToBlob(image.base64, image.mimeType);
        newImageUrls[image.id] = URL.createObjectURL(blob);
    });
    setImageUrls(newImageUrls);

    // Cleanup function to revoke object URLs and prevent memory leaks
    return () => {
      Object.values(newImageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [originalImages]);


  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;

    const imageFiles: Promise<ImageFile>[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64String = (e.target?.result as string)?.split(',')[1];
            if (base64String) {
              resolve({
                id: crypto.randomUUID(),
                base64: base64String,
                mimeType: file.type,
                name: file.name,
              });
            } else {
              reject(new Error("Could not read file"));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

    Promise.all(imageFiles).then(onImagesUpload);
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  }, [onImagesUpload]);

  return (
    <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-cyan-400">1. Upload Images</h2>
        </div>

        {originalImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4 overflow-y-auto max-h-[200px] p-2 bg-black/20 rounded-lg">
                {originalImages.map(image => (
                    <div key={image.id} className="relative group aspect-square">
                        {imageUrls[image.id] && (
                             <img
                                src={imageUrls[image.id]}
                                alt={image.name}
                                className="w-full h-full object-cover rounded-md"
                            />
                        )}
                        <button
                            onClick={() => onImageRemove(image.id)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
         {originalImages.length > 0 && (
            <button onClick={onClearAll} className="text-sm text-red-400 hover:text-red-300 mb-4 self-end">Clear All</button>
         )}


        <label
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full flex-grow border-2 border-dashed rounded-lg cursor-pointer transition-colors min-h-[150px] ${
            isDragging ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
            }`}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500">Upload one or more images</p>
            </div>
            <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
            />
        </label>
    </div>
  );
};

export default ImageUploader;