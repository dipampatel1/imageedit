import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <LogoIcon className="h-8 w-auto" />
      </div>
    </header>
  );
};