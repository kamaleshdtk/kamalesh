import React, { useState, useEffect } from 'react';

const analysisSteps = [
    "Initializing analysis engine...",
    "Establishing secure connection...",
    "Parsing DOM structure from screenshot...",
    "Analyzing visual hierarchy and element grouping...",
    "Evaluating color palette for accessibility (WCAG)...",
    "Measuring typography scale and readability...",
    "Cross-referencing with common UX laws (Hick's, Fitts')...",
    "Detecting potential cognitive load issues...",
    "Identifying inconsistencies in design system...",
    "Simulating user flow for task completion...",
    "Compiling heuristic evaluation report...",
    "Generating actionable recommendations...",
    "Finalizing report and calculating scores...",
];

const LoadingScreen: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % analysisSteps.length);
        }, 2000); // Change step every 2 seconds

        return () => {
            clearInterval(stepInterval);
        };
    }, []);

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 overflow-hidden transition-colors duration-500">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6">
                🔍 Analyzing Your Design...
            </h2>

            {/* Neural Network Animation */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                {/* Central AI Core */}
                <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-pulse-glow"></div>
                
                {/* Orbiting Particles */}
                <div className="absolute w-full h-full">
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary-light/80 rounded-full animate-orbit [animation-delay:-1s]"></div>
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full animate-orbit [animation-delay:-3s] [animation-duration:8s]"></div>
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-orbit-reverse [animation-delay:-2s]"></div>
                     <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary/50 rounded-full animate-orbit-reverse [animation-delay:-5s] [animation-duration:12s]"></div>
                </div>

                {/* Static Rings for structure */}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-primary/10"></div>
                <div className="absolute w-[100%] h-[100%] rounded-full border border-primary/5"></div>
            </div>

            <div className="h-12 flex flex-col items-center justify-center w-full max-w-md">
                <p key={currentStep} className="text-lg font-semibold text-text-secondary dark:text-gray-200 animate-fade-in">
                    {analysisSteps[currentStep]}
                </p>
            </div>
            
            <div className="w-full max-w-md mt-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This usually takes 6–12 seconds.
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;