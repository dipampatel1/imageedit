
import React, { useState, useRef, useEffect } from 'react';
import type { ImageFile, EditedImage } from './types';
import { editImageWithGemini, generateImageWithGemini } from './services/geminiService';
import { checkUsageLimit, incrementUsage } from './services/usageService';
import { saveImage } from './services/imageHistoryService';
import * as authService from './services/authService';
import ImageUploader from './components/ImageUploader';
import EditControls from './components/EditControls';
import GeneratedImage from './components/GeneratedImage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { PricingPage } from './components/PricingPage';
import { HowToUsePage } from './components/HowToUsePage';
import { FAQPage } from './components/FAQPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing' | 'howto' | 'faq'>('home');
  const [mode, setMode] = useState<'edit' | 'generate'>('edit');
  const [originalImages, setOriginalImages] = useState<ImageFile[]>([]);
  const [editedImages, setEditedImages] = useState<EditedImage[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usageWarning, setUsageWarning] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  const handleImagesUpload = (imageFiles: ImageFile[]) => {
    setOriginalImages(prev => [...prev, ...imageFiles]);
    setEditedImages([]);
    setError(null);
  };
  
  const handleRemoveImage = (id: string) => {
    setOriginalImages(prev => prev.filter(image => image.id !== id));
  };
  
  const handleClearAllImages = () => {
    setOriginalImages([]);
    setEditedImages([]);
  };

  const handleProcessImage = async () => {
    if (mode === 'edit' && (originalImages.length === 0 || !prompt.trim())) {
      setError('Please upload at least one image and provide an editing instruction.');
      return;
    }
    if (mode === 'generate' && !prompt.trim()) {
      setError('Please provide a description for the image you want to generate.');
      return;
    }

    // Check if user is authenticated
    const user = await authService.getCurrentUser();
    if (!user) {
      setError('Please sign in to generate images.');
      return;
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit();
    if (!usageCheck.canGenerate) {
      setError(`You've reached your monthly limit of ${usageCheck.limit} images. Please upgrade your plan to continue.`);
      return;
    }

    if (usageCheck.remaining <= 3 && usageCheck.remaining > 0) {
      setUsageWarning(`You have ${usageCheck.remaining} images remaining this month.`);
    }

    setIsLoading(true);
    setError(null);
    setUsageWarning(null);
    setEditedImages([]);

    try {
      const enhancedPrompt = `${prompt}. The final image should have a ${aspectRatio} aspect ratio. Upscale and optimize the image for a high-quality print-on-demand product. Ensure the final image is sharp and detailed.`;
      
      let successfulResults: EditedImage[] = [];

      if (mode === 'edit') {
          const editPromises = originalImages.map(image => 
            editImageWithGemini(image, enhancedPrompt)
          );
    
          const results = await Promise.all(editPromises);
    
          successfulResults = results
            .map((base64, index) => {
                if (base64) {
                    return {
                        id: originalImages[index].id,
                        base64: base64,
                        mimeType: 'image/png',
                        originalName: originalImages[index].name,
                        prompt: prompt,
                        mode: 'edit' as const,
                        createdAt: new Date().toISOString(),
                    };
                }
                return null;
            })
            .filter((item): item is EditedImage => item !== null);
        
        if (successfulResults.length < originalImages.length) {
            setError(`Could only process ${successfulResults.length} out of ${originalImages.length} images. Some may have failed.`);
        }
      } else { // 'generate' mode
        const base64 = await generateImageWithGemini(enhancedPrompt);
        if (base64) {
            successfulResults = [{
                id: crypto.randomUUID(),
                base64: base64,
                mimeType: 'image/png',
                originalName: prompt.slice(0, 30).replace(/\s/g, '_') || 'generated_image',
                prompt: prompt,
                mode: 'generate' as const,
                createdAt: new Date().toISOString(),
            }];
        }
      }

      if (successfulResults.length === 0) {
        throw new Error('The AI model did not return any images. Please try a different prompt.');
      }
      
      setEditedImages(successfulResults);
      
      // Save images to history and increment usage
      for (const image of successfulResults) {
        try {
          await saveImage(image, prompt, mode);
          await incrementUsage();
        } catch (err) {
          console.error('Error saving image or incrementing usage:', err);
          // Don't fail the whole operation if saving fails
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartEditing = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleModeChange = (newMode: 'edit' | 'generate') => {
    setMode(newMode);
    setOriginalImages([]);
    setEditedImages([]);
    setPrompt('');
    setError(null);
  };


  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'home' | 'pricing' | 'howto' | 'faq');
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      <main className="flex-grow">
        {currentPage === 'pricing' && <PricingPage />}
        {currentPage === 'howto' && <HowToUsePage />}
        {currentPage === 'faq' && <FAQPage />}
        
        {currentPage === 'home' && (
          <div className="container mx-auto p-4 md:p-8">
        
        {originalImages.length === 0 && editedImages.length === 0 && <HeroSection onStartEditing={handleStartEditing} />}
        
        <div ref={editorRef}>
            <div className="flex justify-center mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-full p-1 flex items-center space-x-1">
                    <button onClick={() => handleModeChange('edit')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'edit' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Edit Image
                    </button>
                    <button onClick={() => handleModeChange('generate')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${mode === 'generate' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        Generate Image
                    </button>
                </div>
            </div>

            {usageWarning && (
              <div className="mb-4 bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg">
                <p className="font-semibold">Usage Warning</p>
                <p className="text-sm">{usageWarning}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col space-y-6">
                {mode === 'edit' && (
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-700">
                        <ImageUploader 
                          onImagesUpload={handleImagesUpload} 
                          onImageRemove={handleRemoveImage}
                          onClearAll={handleClearAllImages}
                          originalImages={originalImages}
                        />
                    </div>
                )}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-700">
                    <EditControls
                      mode={mode}
                      prompt={prompt}
                      setPrompt={setPrompt}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      onProcess={handleProcessImage}
                      isLoading={isLoading}
                      isReady={(mode === 'edit' && originalImages.length > 0) || mode === 'generate'}
                    />
                </div>
              </div>
    
              <div className="flex flex-col bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-700">
                <GeneratedImage 
                  editedImages={editedImages}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </div>
        </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
