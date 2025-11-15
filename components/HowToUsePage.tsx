import React from 'react';

export const HowToUsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How to Use AI Image Editor
          </h1>
          <p className="text-xl text-slate-400">
            Learn how to create and edit stunning images with AI
          </p>
        </div>

        <div className="space-y-8">
          {/* Getting Started */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Getting Started
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-white">Step 1:</strong> Sign up for a free account to get started. You'll receive 25 free images per month to explore our features.
              </p>
              <p>
                <strong className="text-white">Step 2:</strong> Choose between two modes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong className="text-cyan-400">Edit Image:</strong> Upload an existing image and transform it with AI</li>
                <li><strong className="text-cyan-400">Generate Image:</strong> Create new images from text descriptions</li>
              </ul>
            </div>
          </section>

          {/* Editing Images */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Editing Images
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-white">Step 1:</strong> Click on "Edit Image" mode at the top of the page.
              </p>
              <p>
                <strong className="text-white">Step 2:</strong> Upload one or more images by clicking the upload area or dragging and dropping files.
              </p>
              <p>
                <strong className="text-white">Step 3:</strong> Enter your editing instructions in the prompt box. Be specific about what you want to change:
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 ml-4">
                <p className="text-sm text-slate-400 mb-2">Example prompts:</p>
                <ul className="space-y-1 text-sm">
                  <li>• "Change the background to a sunset beach scene"</li>
                  <li>• "Make the colors more vibrant and add dramatic lighting"</li>
                  <li>• "Remove the person and replace with a mountain landscape"</li>
                  <li>• "Convert to black and white with high contrast"</li>
                </ul>
              </div>
              <p>
                <strong className="text-white">Step 4:</strong> Select your desired aspect ratio (1:1, 16:9, 9:16, etc.).
              </p>
              <p>
                <strong className="text-white">Step 5:</strong> Click "Generate" and wait for the AI to process your image (usually 10-30 seconds).
              </p>
              <p>
                <strong className="text-white">Step 6:</strong> Download your edited image or save it to your gallery.
              </p>
            </div>
          </section>

          {/* Generating Images */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Generating New Images
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-white">Step 1:</strong> Click on "Generate Image" mode at the top of the page.
              </p>
              <p>
                <strong className="text-white">Step 2:</strong> Write a detailed description of the image you want to create. The more specific, the better:
              </p>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 ml-4">
                <p className="text-sm text-slate-400 mb-2">Example prompts:</p>
                <ul className="space-y-1 text-sm">
                  <li>• "A futuristic cityscape at night with neon lights and flying cars, cyberpunk style"</li>
                  <li>• "A serene mountain lake at sunrise with mist and pine trees, photorealistic"</li>
                  <li>• "Abstract geometric patterns in blue and gold, minimalist design"</li>
                  <li>• "A cozy coffee shop interior with warm lighting and plants, vintage aesthetic"</li>
                </ul>
              </div>
              <p>
                <strong className="text-white">Step 3:</strong> Choose your aspect ratio based on your intended use:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong className="text-cyan-400">1:1</strong> - Square (perfect for social media)</li>
                <li><strong className="text-cyan-400">16:9</strong> - Widescreen (for banners, presentations)</li>
                <li><strong className="text-cyan-400">9:16</strong> - Portrait (for mobile content)</li>
                <li><strong className="text-cyan-400">4:3</strong> - Standard (for traditional prints)</li>
              </ul>
              <p>
                <strong className="text-white">Step 4:</strong> Click "Generate" and wait for your image to be created.
              </p>
              <p>
                <strong className="text-white">Step 5:</strong> Download or save your generated image to your gallery.
              </p>
            </div>
          </section>

          {/* Tips for Best Results */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
              Tips for Best Results
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-2">Writing Effective Prompts:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Be specific:</strong> Instead of "a dog," say "a golden retriever puppy playing in a garden"</li>
                  <li>• <strong>Include style:</strong> Mention artistic styles like "photorealistic," "watercolor," "3D render," or "oil painting"</li>
                  <li>• <strong>Describe mood:</strong> Add words like "dramatic," "serene," "vibrant," or "mysterious"</li>
                  <li>• <strong>Specify details:</strong> Include lighting, colors, composition, and atmosphere</li>
                  <li>• <strong>Use negative prompts:</strong> You can mention what you DON'T want (e.g., "no text, no people")</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-2">Image Editing Tips:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Upload high-quality images for better results</li>
                  <li>• Be clear about what you want to change or keep</li>
                  <li>• Try multiple variations with different prompts</li>
                  <li>• Use specific aspect ratios for your intended use case</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Managing Your Images */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
              Managing Your Images
            </h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-white">Image Gallery:</strong> All your generated and edited images are automatically saved to your gallery. Access it from your user profile menu.
              </p>
              <p>
                <strong className="text-white">Download Images:</strong> Click the download button on any image to save it to your device.
              </p>
              <p>
                <strong className="text-white">Delete Images:</strong> Remove images from your gallery by clicking the delete button.
              </p>
              <p>
                <strong className="text-white">Usage Tracking:</strong> Monitor your remaining image credits in the header. Free users get 25 images per month, with more available in paid plans.
              </p>
            </div>
          </section>

          {/* Need Help */}
          <section className="bg-cyan-900/20 border border-cyan-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
            <p className="text-slate-300 mb-6">
              Check out our FAQ section or contact our support team for assistance.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="#faq" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors">
                View FAQ
              </a>
              <a href="mailto:support@example.com" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors">
                Contact Support
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

