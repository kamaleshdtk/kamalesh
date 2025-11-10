import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  userPlan: {
    name: string;
    reviewsUsed: number;
    reviewsLimit: number;
  };
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, userPlan }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 text-center animate-fade-in">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-white mt-5">Upgrade Your Plan</h2>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          You've used all {userPlan.reviewsUsed}/{userPlan.reviewsLimit} of your reviews for this month.
        </p>
        <p className="mt-1 text-text-secondary dark:text-gray-400">
          Please upgrade your plan to continue analyzing designs.
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors order-2 sm:order-1"
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors order-1 sm:order-2"
          >
            View Plans & Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
