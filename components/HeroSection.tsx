
import React from 'react';
import { HeroImageIcon } from './icons/HeroImageIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface HeroSectionProps {
    onStartEditing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartEditing }) => {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 py-16 md:py-32 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="text-center lg:text-left relative z-10">
                <div className="inline-block mb-4 px-4 py-2 rounded-full glass-effect border border-purple-400/30">
                    <span className="text-sm font-semibold text-gradient-primary">✨ AI-Powered Creative Studio</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                    <span className="text-gradient-primary">Unleash Your</span>
                    <br />
                    <span className="text-white">Creativity</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    Transform your photos or bring your ideas to life from a text description. Use simple prompts to perform complex edits or generate unique images from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                        onClick={onStartEditing}
                        className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl glow-cyan overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Creating for Free
                            <ArrowDownIcon className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 animate-shimmer"></div>
                    </button>
                    <button
                        onClick={() => window.location.hash = '#pricing'}
                        className="inline-flex items-center justify-center gap-2 glass-effect border-2 border-purple-400/30 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:border-purple-400/60 hover:bg-white/5"
                    >
                        View Pricing
                    </button>
                </div>
                
                {/* Feature highlights */}
                <div className="mt-12 flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"></div>
                        <span>No Credit Card Required</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                        <span>25 Free Images</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-cyan-400"></div>
                        <span>Instant Results</span>
                    </div>
                </div>
            </div>
            
            <div className="hidden lg:flex items-center justify-center relative z-10">
                <div className="relative animate-float">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl transform rotate-6"></div>
                    <HeroImageIcon className="w-full h-auto max-w-lg relative z-10" />
                </div>
            </div>
        </section>
    );
};
