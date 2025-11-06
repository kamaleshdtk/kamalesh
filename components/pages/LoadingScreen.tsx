
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyzing visual hierarchy...",
  "Checking for color contrast and accessibility...",
  "Applying Gestalt Principles...",
  "Consulting the Laws of UX...",
  "Generating actionable recommendations...",
  "Finalizing the report...",
];

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // Animate progress from 0 to 99 over ~15 seconds to simulate a realistic process
  useEffect(() => {
    const totalDuration = 15000; // 15 seconds
    const intervalTime = 150; // Update every 150ms
    const increments = totalDuration / intervalTime;
    const progressIncrement = 99 / increments;

    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + progressIncrement;
        if (newProgress >= 99) {
          clearInterval(interval);
          return 99;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  // Update the message based on the progress
  useEffect(() => {
    const newMessageIndex = Math.min(
      Math.floor(progress / (100 / loadingMessages.length)),
      loadingMessages.length - 1
    );
    setMessageIndex(newMessageIndex);
  }, [progress]);


  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 mt-6">Analyzing your design...</h2>
      <p className="text-gray-600 mt-2 max-w-sm">
        Our AI is hard at work. This usually takes less than a minute.
      </p>

      <div className="w-full max-w-md mt-10">
        <div className="flex justify-between items-center mb-2 text-sm font-medium">
          <p className="text-primary transition-opacity duration-500">
              {loadingMessages[messageIndex]}
          </p>
          <p className="text-gray-600">{Math.round(progress)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
