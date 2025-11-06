
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const baseClasses = 'relative w-full p-4 pr-12 text-white rounded-lg shadow-lg flex items-center gap-3';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
  };

  const Icon = () => {
      if (type === 'success') {
          return (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )
      }
      return (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      )
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
        <Icon />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onDismiss} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/70 hover:text-white transition-colors" aria-label="Dismiss">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
  );
};

export default Toast;
