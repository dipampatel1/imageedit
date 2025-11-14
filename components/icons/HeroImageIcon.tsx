
import React from 'react';

export const HeroImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(34, 211, 238)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(251, 191, 36)', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        
        <g opacity="0.7" filter="url(#glow)">
            <path 
                d="M 50,200 C 50,100 150,100 150,200 S 250,300 250,200" 
                fill="none" 
                stroke="url(#grad1)" 
                strokeWidth="10"
                strokeLinecap="round"
            />
            <path 
                d="M 150,200 C 150,100 250,100 250,200 S 350,300 350,200" 
                fill="none" 
                stroke="url(#grad1)" 
                strokeWidth="10"
                strokeLinecap="round"
            />
        </g>
        
        <circle cx="100" cy="150" r="15" fill="rgb(34, 211, 238)" opacity="0.8" />
        <circle cx="300" cy="250" r="20" fill="rgb(251, 191, 36)" opacity="0.8" />
        
        <rect x="180" y="180" width="40" height="40" rx="10" fill="white" opacity="0.1" transform="rotate(45 200 200)"/>

        <path d="M 50 350 Q 200 50 350 350" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.3"/>
    </svg>
);
