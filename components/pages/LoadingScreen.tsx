
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyzing visual hierarchy...",
  "Checking for color contrast and accessibility...",
  "Applying Gestalt Principles...",
  "Consulting the Laws of UX...",
  "Generating actionable recommendations...",
  "Finalizing the report...",
];

const Spinner = () => (
  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
);

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <Spinner />
      <h2 className="text-2xl font-bold text-text-primary mt-6">Analyzing your design...</h2>
      <p className="text-text-secondary mt-2 max-w-sm">
        Our AI is hard at work. This usually takes less than a minute.
      </p>
      <div className="mt-8 h-6">
        <p className="text-primary font-medium transition-opacity duration-500">
            {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
