import React from 'react';

const Slider: React.FC<{ label: string; options: string[]; value: string; setValue: (value: string) => void; description: string; }> = ({ label, options, value, setValue, description }) => {
    const valueIndex = options.indexOf(value);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative mt-3 pt-2">
                 <input
                    type="range"
                    min="0"
                    max={options.length - 1}
                    value={valueIndex}
                    onChange={(e) => setValue(options[Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {options.map(opt => <span key={opt}>{opt}</span>)}
                </div>
            </div>
             <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">{description}</p>
        </div>
    );
};

export default Slider;
