import React from 'react';
import SectionCard from '../shared/SectionCard';

const HelpPanel: React.FC = () => (
    <SectionCard title="Help & Support" description="Need help? Find your answers here.">
        <div className="space-y-4">
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <div>
                    <p className="font-semibold text-text-primary dark:text-white">Documentation</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Read our guides and tutorials.</p>
                </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                    <p className="font-semibold text-text-primary dark:text-white">Contact Support</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Get in touch with our team.</p>
                </div>
            </a>
        </div>
    </SectionCard>
);

export default HelpPanel;
