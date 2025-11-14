import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/60 border-t border-slate-700 mt-8">
      <div className="container mx-auto px-4 md:px-8 py-6 text-slate-500 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} imageedit. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            </div>
        </div>
      </div>
    </footer>
  );
};