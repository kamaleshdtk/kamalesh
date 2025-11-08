import React from 'react';

const SectionCard: React.FC<{ title: string; description?: string; children: React.ReactNode; rightContent?: React.ReactNode; }> = ({ title, description, children, rightContent }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700 rounded-xl shadow-soft border">
            <div className="dark:border-gray-700 p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">{title}</h3>
                    {description && <p className="text-sm mt-1 text-text-secondary dark:text-gray-400">{description}</p>}
                </div>
                {rightContent}
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

export default SectionCard;
