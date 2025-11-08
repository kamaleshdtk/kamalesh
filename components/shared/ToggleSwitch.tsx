import React from 'react';

const ToggleSwitch: React.FC<{ label: string; description: string; enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ label, description, enabled, setEnabled }) => (
    <div className="flex justify-between items-center py-4">
        <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <label htmlFor={`toggle-${label.replace(/\s+/g, '-')}`} className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={`toggle-${label.replace(/\s+/g, '-')}`}
                className="sr-only peer"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-light peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

export default ToggleSwitch;
