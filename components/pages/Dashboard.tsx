

import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { fileToDataUrl, urlToDataUrl } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import ScreenshotFallbackModal from './ScreenshotFallbackModal';
import ReportCard from '../shared/ReportCard';


interface DashboardProps {
  onSubmit: (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image',
    forceRefresh: boolean
  ) => void;
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onNavigateToHistory: () => void;
}

const AnalysisForm: React.FC<{
    onSubmit: DashboardProps['onSubmit'];
    onScreenshotFail: (url: string, reviewType: ReviewType) => void;
}> = ({ onSubmit, onScreenshotFail }) => {
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.UI);
  const [image, setImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        addToast("File size exceeds 4MB. Please upload a smaller image.", 'error');
        return;
      }
      const imageData = await fileToDataUrl(file);
      setImage(imageData);
      setUrl('');
    }
  }, [addToast]);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(image) setImage(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !url) {
      addToast('Please upload an image or enter a URL.', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (image) {
        onSubmit(image, reviewType, image.name, 'Image', forceRefresh);
      } else if (url) {
        const screenshot = await urlToDataUrl(url);
        onSubmit(screenshot, reviewType, url, 'URL', forceRefresh);
      }
    } catch (err: any) {
      if (url) {
        onScreenshotFail(url, reviewType);
      } else {
        addToast(err.message || 'An unknown error occurred.', 'error');
      }
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-3xl w-full mx-auto mt-12"
    >
      <fieldset disabled={isSubmitting} className="transition-opacity duration-300 disabled:opacity-60">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-form-soft dark:border dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={image ? `File: ${image.name}` : url}
              onChange={handleUrlChange}
              readOnly={!!image}
              placeholder="Enter a website URL ( e.g., https://example.com)"
              className="w-full text-base bg-transparent dark:text-white focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 px-2 pt-2"
            />
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

          <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors"
                aria-label="Upload image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewType(ReviewType.UI)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${reviewType === ReviewType.UI ? 'bg-primary text-white font-semibold' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  UI Analyze
                </button>
                <button
                  type="button"
                  onClick={() => setReviewType(ReviewType.UX)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${reviewType === ReviewType.UX ? 'bg-primary text-white font-semibold' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  UX Analyze
                </button>
                 <button
                    type="submit"
                    disabled={!image && !url}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    aria-label="Start analysis"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                </button>
              </div>
          </div>
        </div>
         <div className="mt-4 flex justify-end">
              <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                   <svg className={`w-3 h-3 text-white transition-opacity ${forceRefresh ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Re-analyze (ignore cache)
              </label>
          </div>
        </fieldset>
    </form>
  )
}

const Dashboard: React.FC<DashboardProps> = ({ onSubmit, reports, onViewReport, onNavigateToHistory }) => {
  const [fallbackInfo, setFallbackInfo] = useState<{ url: string; reviewType: ReviewType } | null>(null);

  const handleScreenshotFail = (url: string, reviewType: ReviewType) => {
    setFallbackInfo({ url, reviewType });
  };
  
  const handleFallbackSubmit = (manualImage: { data: string; mimeType: string; name: string }) => {
    if (fallbackInfo) {
      onSubmit(manualImage, fallbackInfo.reviewType, fallbackInfo.url, 'URL', true);
      setFallbackInfo(null);
    }
  };
  
  const recentReports = reports.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <div className="text-center pt-10 sm:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
            Get Instant UI & UX Feedback
          </h1>
          <p className="mt-6 text-md sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload a screenshot or paste a URL to have your design analyzed by our expert AI in seconds. Stop guessing, start improving.
          </p>
          <AnalysisForm onSubmit={onSubmit} onScreenshotFail={handleScreenshotFail} />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent History</h2>
            {reports.length > 3 && (
                <button 
                    onClick={onNavigateToHistory}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View All
                </button>
            )}
        </div>
        {reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentReports.map(report => (
                    <ReportCard key={report.id} report={report} onView={onViewReport} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200/60 dark:border-gray-700">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                </div>
                <h3 className="mt-5 text-xl font-bold text-text-primary dark:text-white">No history yet</h3>
                <p className="mt-2 text-base text-text-secondary dark:text-gray-400">Your first analysis will appear here.</p>
            </div>
        )}
      </div>

      {fallbackInfo && (
        <ScreenshotFallbackModal
          isOpen={!!fallbackInfo}
          onClose={() => setFallbackInfo(null)}
          onSubmit={handleFallbackSubmit}
          url={fallbackInfo.url}
        />
      )}
    </>
  );
};

export default Dashboard;