import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';

interface ScreenshotFallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  url: string;
  reason?: string;
}

const ScreenshotFallbackModal: React.FC<ScreenshotFallbackModalProps> = ({ isOpen, onClose, onSubmit, url, reason }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        addToast("File size exceeds 15MB. Please upload a smaller image.", 'error');
        return;
      }
      setImageFile(file);
      setImageName(file.name);
    }
  }, [addToast]);
  
  const handleSubmit = () => {
    if (!imageFile) {
      addToast("Please upload a screenshot to continue.", 'error');
      return;
    }
    setIsSubmitting(true);
    onSubmit(imageFile);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Screenshot Failed</h2>
        <p className="mt-2 text-text-secondary dark:text-gray-400">
          We couldn't automatically capture a screenshot for the URL: <strong className="text-primary break-all">{url}</strong>.
        </p>
        {reason && (
             <p className="mt-2 text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-200 rounded-lg">
                <strong>Reason:</strong> {reason}
            </p>
        )}
        <p className="mt-3 text-text-secondary dark:text-gray-400">
          Please take a screenshot manually and upload it below to proceed with the analysis.
        </p>

        <div className="mt-6">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-center px-4 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {imageName ? (
                <div className="text-green-600 dark:text-green-400 font-semibold">
                    <p>✓ {imageName}</p>
                    <p className="text-sm font-normal mt-1">Click to change file</p>
                </div>
            ) : (
                <div className="text-gray-500 dark:text-gray-400">
                    <p className="font-semibold">Click to upload a screenshot</p>
                    <p className="text-sm mt-1">PNG, JPG, WEBP (Max 15MB)</p>
                </div>
            )}
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imageFile || isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotFallbackModal;