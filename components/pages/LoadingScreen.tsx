import React, { useState, useEffect } from 'react';

// A larger list of engaging UI/UX tips
const uxTips = [
    "Hick's Law: The time it takes to make a decision increases with the number and complexity of choices.",
    "Fitts's Law: The time to acquire a target is a function of the distance to and size of the target. Make buttons large enough!",
    "Jakob's Law: Users spend most of their time on other sites. This means they prefer your site to work the same way as all the other sites they already know.",
    "The Aesthetic-Usability Effect: Users often perceive aesthetically pleasing design as design that’s more usable.",
    "Rule of Thirds: Placing important elements along the intersections of a 3x3 grid makes designs more visually appealing.",
    "White space is not wasted space. It improves readability and reduces cognitive load.",
    "Good contrast isn't just for accessibility; it helps all users focus on what's important.",
    "Users read in an 'F' pattern on web pages. Place your most important content on the top and left.",
    "Miller's Law: The average person can only keep about 7 (plus or minus 2) items in their working memory.",
    "Occam's Razor: The simplest solution is almost always the best. Avoid unnecessary elements.",
    "Don't make users think. Your design's purpose should be self-evident.",
];

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Animate progress from 0 to 99 over ~15 seconds to simulate a realistic process
  useEffect(() => {
    const totalDuration = 15000; // 15 seconds
    const intervalTime = 150; // Update every 150ms
    const increments = totalDuration / intervalTime;
    const progressIncrement = 99 / increments;

    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + progressIncrement;
        if (newProgress >= 99) {
          clearInterval(progressInterval);
          return 99;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, []);

  // Cycle through UX tips every 4 seconds
  useEffect(() => {
      const tipInterval = setInterval(() => {
          setTipIndex(prevIndex => (prevIndex + 1) % uxTips.length);
      }, 4000); // Change tip every 4 seconds

      return () => clearInterval(tipInterval);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">Analyzing your design...</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm">
        Our AI is hard at work. This usually takes less than a minute.
      </p>

      <div className="w-full max-w-md mt-10">
        <div className="flex justify-between items-center mb-2 text-sm font-medium">
          <p className="text-gray-600 dark:text-gray-400">Status</p>
          <p className="text-gray-600 dark:text-gray-400">{Math.round(progress)}%</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="w-full max-w-md mt-8 text-center p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold text-primary mb-1">UX Tip:</p>
          <p className="text-text-secondary dark:text-gray-300 text-sm">
              {uxTips[tipIndex]}
          </p>
      </div>

    </div>
  );
};

export default LoadingScreen;
