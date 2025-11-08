import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCache: () => void;
  user: {
    name: string;
    avatar: string;
  };
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearCache, user }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) {
    return null;
  }
  
  const handleClear = () => {
    onClearCache();
    setShowConfirm(false);
  };

  const handleClose = () => {
    setShowConfirm(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Settings</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="mt-6 border-t dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</h3>
            <div className="flex items-center gap-4 mt-4">
                <img src={user.avatar} alt="User Avatar" className="w-12 h-12 rounded-full"/>
                <div>
                    <p className="font-bold text-text-primary dark:text-white">{user.name}</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Logged in as Demo User</p>
                </div>
            </div>
        </div>
        
        <div className="mt-6 border-t dark:border-gray-700 pt-6">
             <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cache Management</h3>
             <div className="mt-4">
                 <p className="text-sm text-text-secondary dark:text-gray-400">
                    Clearing the cache will remove all your locally stored reports and analysis history. This action cannot be undone.
                 </p>
                {!showConfirm ? (
                     <button
                        onClick={() => setShowConfirm(true)}
                        className="mt-4 w-full px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                     >
                        Clear Analysis Cache...
                     </button>
                ) : (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">Are you sure?</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">This will permanently delete all your local data.</p>
                        <div className="mt-3 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                                Yes, Clear Cache
                            </button>
                        </div>
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;