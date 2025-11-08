import React from 'react';

const HistoryEmptyState: React.FC = () => (
  <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200/60 dark:border-gray-700">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
      </div>
      <h3 className="mt-5 text-xl font-bold text-text-primary dark:text-white">Your History is Empty</h3>
      <p className="mt-2 text-base text-text-secondary dark:text-gray-400">Start your first analysis to see your reports here.</p>
  </div>
);

export default HistoryEmptyState;