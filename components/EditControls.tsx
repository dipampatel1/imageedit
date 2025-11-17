
import React from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface EditControlsProps {
  mode: 'edit' | 'generate';
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  onProcess: () => void;
  isLoading: boolean;
  isReady: boolean;
}

const EditControls: React.FC<EditControlsProps> = ({ mode, prompt, setPrompt, aspectRatio, setAspectRatio, onProcess, isLoading, isReady }) => {
  const editPrompts = [
    "Add a retro, vintage filter",
    "Make the background blurry",
    "Change the season to autumn",
    "Add cinematic lighting",
    "Remove the person in the background"
  ];

  const generatePrompts = [
    "A majestic lion wearing a crown, photorealistic",
    "Futuristic city skyline at sunset, synthwave style",
    "Enchanted forest with glowing mushrooms, fantasy art",
    "A cute robot holding a flower, 3D render",
    "Impressionist painting of a cafe in Paris"
  ];

  const popularPrompts = mode === 'edit' ? editPrompts : generatePrompts;

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  const isGenerationDisabled = isLoading || !isReady || !prompt.trim();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gradient-primary mb-6 flex items-center gap-2">
          <MagicWandIcon className="w-6 h-6" />
          {mode === 'edit' ? 'Configure Your Edit' : 'Describe Your Vision'}
        </h2>
        <div className="flex flex-col space-y-5">
          <div>
            <label htmlFor="prompt-textarea" className="block text-sm font-semibold text-slate-200 mb-3">{mode === 'edit' ? '✨ Editing Instructions' : '🎨 Image Description'}</label>
            <textarea
              id="prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'edit' ? "e.g., 'Add a magical glow to the mountains' or 'Change the car's color to cherry red'" : "e.g., 'A photo of a white cat wearing sunglasses, studio lighting'"}
              className="w-full p-4 glass-dark border-2 border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 placeholder-slate-400 text-white resize-none"
              rows={4}
              disabled={!isReady && mode === 'edit'}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 mb-3">💡 Quick Prompts:</p>
            <div className="flex flex-wrap gap-2">
              {popularPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  disabled={!isReady && mode === 'edit'}
                  className="px-4 py-2 text-xs font-medium glass-effect border border-white/10 hover:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-all duration-300 hover:scale-105"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-3">📐 Aspect Ratio</label>
        <div className="flex flex-wrap gap-3">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              disabled={!isReady && mode === 'edit'}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 transform border-2
                ${
                  aspectRatio === ratio
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 border-transparent text-white shadow-lg glow-cyan scale-105'
                    : 'glass-effect border-white/10 text-slate-300 hover:border-purple-400/50 hover:scale-105'
                }
                ${!isReady && mode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onProcess}
        disabled={isGenerationDisabled}
        className={`group relative w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform overflow-hidden ${
          isGenerationDisabled
            ? 'bg-slate-700 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:scale-105 shadow-2xl glow-cyan'
        }`}
      >
        {isLoading ? (
          <span className="relative z-10 flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Magic...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center gap-3">
            <MagicWandIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>{mode === 'edit' ? '✨ Apply Edit' : '🎨 Generate Image'}</span>
          </span>
        )}
        {!isGenerationDisabled && <div className="absolute inset-0 animate-shimmer"></div>}
      </button>
    </div>
  );
};

export default EditControls;
