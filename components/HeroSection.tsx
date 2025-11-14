
import React from 'react';
import { HeroImageIcon } from './icons/HeroImageIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface HeroSectionProps {
    onStartEditing: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartEditing }) => {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 py-12 md:py-24">
            <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                    Unleash Your Creativity with AI-Powered Image Editing & Generation
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                    Transform your photos or bring your ideas to life from a text description. Use simple prompts to perform complex edits or generate unique images from scratch. Perfect for creators, marketers, and print-on-demand businesses.
                </p>
                <button
                    onClick={onStartEditing}
                    className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                    Start Creating for Free
                    <ArrowDownIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="hidden lg:flex items-center justify-center">
                <HeroImageIcon className="w-full h-auto max-w-lg" />
            </div>
        </section>
    );
};
