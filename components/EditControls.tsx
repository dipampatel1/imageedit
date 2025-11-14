
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-4">{mode === 'edit' ? '2. Configure Edit' : '2. Describe Your Image'}</h2>
        <div className="flex flex-col space-y-4">
          <div>
            <label htmlFor="prompt-textarea" className="block text-sm font-medium text-slate-300 mb-2">{mode === 'edit' ? 'Editing Instructions' : 'Image Description'}</label>
            <textarea
              id="prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'edit' ? "e.g., 'Add a magical glow to the mountains' or 'Change the car's color to cherry red'" : "e.g., 'A photo of a white cat wearing sunglasses, studio lighting'"}
              className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors placeholder-slate-500"
              rows={3}
              disabled={!isReady && mode === 'edit'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {popularPrompts.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                disabled={!isReady && mode === 'edit'}
                className="px-3 py-1 text-xs bg-slate-700 hover:bg-cyan-800 disabled:bg-slate-800 disabled:text-slate-500 rounded-full transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
        <div className="flex flex-wrap gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              disabled={!isReady && mode === 'edit'}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors border-2
                ${
                  aspectRatio === ratio
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700'
                }
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
        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <MagicWandIcon className="w-5 h-5" />
            Generate Image
          </>
        )}
      </button>
    </div>
  );
};

export default EditControls;
