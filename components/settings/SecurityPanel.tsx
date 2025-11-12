import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import SectionCard from '../shared/SectionCard';

interface SecurityPanelProps {
    onLogout: () => void;
    onOpenClearCacheModal: () => void;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ onLogout, onOpenClearCacheModal }) => {
    const [deleteInput, setDeleteInput] = useState('');
    const { addToast } = useToast();

    const handleDeleteAccount = () => {
        if (deleteInput === 'DELETE MY ACCOUNT') {
            addToast('Account deleted successfully.', 'success');
            onLogout();
        } else {
            addToast('Confirmation text does not match.', 'error');
        }
    };
    return (
        <div className="space-y-8">
            <SectionCard title="Password">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <p className="text-text-secondary dark:text-gray-400">Change your password regularly to keep your account secure.</p>
                     <button onClick={() => addToast('Password change modal would open here.', 'success')} className="px-4 py-2 text-sm font-semibold text-primary dark:text-primary-light border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Change Password</button>
                </div>
            </SectionCard>
             <SectionCard title="Two-Factor Authentication">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <p className="text-text-secondary dark:text-gray-400">Add an extra layer of security to your account.</p>
                     <button onClick={() => addToast('2FA setup modal would open here.', 'success')} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors">Enable 2FA</button>
                </div>
            </SectionCard>
            <div className="bg-danger-bg dark:bg-red-900/20 p-6 rounded-xl border border-danger-border dark:border-red-500/30">
                <h3 className="text-lg font-bold text-danger-text">Danger Zone</h3>
                
                <div className="mt-4 border-t border-danger-border/50 dark:border-red-500/20 pt-4">
                    <h4 className="font-semibold text-red-900/90 dark:text-red-200">Clear Analysis Cache</h4>
                    <p className="text-sm text-red-900/80 dark:text-red-300 mt-1">This will permanently remove all locally stored reports. This can be useful to free up space or fix display issues.</p>
                     <button onClick={onOpenClearCacheModal} className="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors">
                        Clear Cache...
                    </button>
                </div>

                <div className="mt-4 border-t border-danger-border/50 dark:border-red-500/20 pt-4">
                    <h4 className="font-semibold text-red-900/90 dark:text-red-200">Delete Account</h4>
                    <p className="text-sm text-red-900/80 dark:text-red-300 mt-1">Deleting your account is a permanent action and cannot be undone.</p>
                    <div className="mt-4">
                        <label className="text-sm font-semibold text-red-800 dark:text-red-200">To confirm, please type <strong className="font-mono">DELETE MY ACCOUNT</strong> below.</label>
                        <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm dark:text-white" />
                        <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE MY ACCOUNT'} className="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed">
                            Delete My Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityPanel;