
import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SuccessToastProps {
    message: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
    return (
        <div className="fixed top-5 right-5 bg-green-600/80 backdrop-blur-sm border border-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 z-50 animate-slide-in">
            <CheckCircleIcon className="w-6 h-6" />
            <p className="font-semibold">{message}</p>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </div>
    );
};

export default SuccessToast;
