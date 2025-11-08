

import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import ReportCard from '../shared/ReportCard';

type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

interface DashboardProps {
  onSubmit: (submission: Submission, reviewType: ReviewType) => void;
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onNavigateToHistory: () => void;
}

const AnalysisForm: React.FC<{
    onSubmit: DashboardProps['onSubmit'];
}> = ({ onSubmit }) => {
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.UI);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 15 * 1024 * 1024) { // 15MB limit
        addToast("File size exceeds 15MB. Please upload a smaller image.", 'error');
        return;
      }
      setImageFile(file);
      setImageName(file.name);
      setUrl('');
    }
  }, [addToast]);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(imageFile) {
        setImageFile(null);
        setImageName('');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !url) {
      addToast('Please upload an image or enter a URL.', 'error');
      return;
    }
    
    if (imageFile) {
        onSubmit({ type: 'Image', value: imageFile }, reviewType);
    } else if (url) {
        onSubmit({ type: 'URL', value: url }, reviewType);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-3xl w-full mx-auto mt-12"
    >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 shadow-form-soft dark:border dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={imageName ? `File: ${imageName}` : url}
              onChange={handleUrlChange}
              readOnly={!!imageFile}
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
                    disabled={!imageFile && !url}
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-light disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    aria-label="Start analysis"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                </button>
              </div>
          </div>
        </div>
    </form>
  )
}

const Dashboard: React.FC<DashboardProps> = ({ onSubmit, reports, onViewReport, onNavigateToHistory }) => {
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
          <AnalysisForm onSubmit={onSubmit} />
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
    </>
  );
};

export default Dashboard;