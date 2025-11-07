
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { fileToDataUrl, urlToDataUrl, getDisplayName, formatDate } from '../../utils';
import { useToast } from '../../contexts/ToastContext';
import ScreenshotFallbackModal from './ScreenshotFallbackModal';

interface DashboardProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onSubmit: (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image',
    forceRefresh: boolean
  ) => void;
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-form-soft">
        <div className="relative">
          <input
            type="text"
            value={image ? `File: ${image.name}` : url}
            onChange={handleUrlChange}
            readOnly={!!image}
            disabled={isSubmitting}
            placeholder="Enter a website URL ( e.g., https://example.com)"
            className="w-full text-base bg-transparent focus:outline-none placeholder-gray-500 px-2 pt-2 disabled:opacity-50"
          />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

        <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewType === ReviewType.UI ? 'bg-primary text-white font-semibold' : 'bg-gray-100 text-gray-600 font-medium hover:bg-gray-200'}`}
              >
                UI Analyze
              </button>
              <button
                type="button"
                onClick={() => setReviewType(ReviewType.UX)}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewType === ReviewType.UX ? 'bg-primary text-white font-semibold' : 'bg-gray-100 text-gray-600 font-medium hover:bg-gray-200'}`}
              >
                UX Analyze
              </button>
               <button
                  type="submit"
                  disabled={!image && !url || isSubmitting}
                  className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
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
            <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={forceRefresh}
                onChange={(e) => setForceRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <span className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                 <svg className={`w-3 h-3 text-white transition-opacity ${forceRefresh ? 'opacity-100' : 'opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              Re-analyze (ignore cache)
            </label>
        </div>
    </form>
  )
}

const ReportCard: React.FC<{report: AnalysisReport; onView: (report: AnalysisReport) => void}> = ({ report, onView }) => {
    const displayName = getDisplayName(report);
    const score = report.review_type === ReviewType.UI ? report.ui_score : report.ux_score;

    const getScoreColor = (s: number) => {
        if (s >= 85) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <button
          className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden text-left w-full"
          onClick={() => onView(report)}
        >
            <div className="h-48 bg-gray-100">
                <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800 truncate" title={report.input_value}>
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(report.created_at)}</p>
                    <span className="mt-3 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {report.review_type}
                    </span>
                </div>
                <div className="flex items-baseline pl-4">
                    <span className={`text-5xl font-extrabold ${getScoreColor(score)}`}>
                        {score}
                    </span>
                    <span className="text-xl font-semibold text-gray-400">/100</span>
                </div>
            </div>
        </button>
    );
};

const HistoryEmptyState: React.FC = () => (
  <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-soft border border-gray-200/60">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
      </div>
      <h3 className="mt-5 text-xl font-bold text-text-primary">Your History is Empty</h3>
      <p className="mt-2 text-base text-text-secondary">Start your first analysis to see your reports here.</p>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit, onNavigateToHistory }) => {
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
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900">
            Get Instant UI & UX Feedback
          </h1>
          <p className="mt-6 text-md sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a screenshot or paste a URL to have your design analyzed by our expert AI in seconds. Stop guessing, start improving.
          </p>
          <AnalysisForm onSubmit={onSubmit} onScreenshotFail={handleScreenshotFail} />
        </div>
      </div>
      
      {/* Recent History Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
         {reports.length > 0 ? (
             <>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-text-primary">Recent History</h3>
                    <button onClick={onNavigateToHistory} className="text-sm font-semibold text-primary hover:underline">
                        View all
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentReports.map(report => (
                        <ReportCard key={report.id} report={report} onView={onViewReport} />
                    ))}
                </div>
             </>
         ) : (
            <HistoryEmptyState />
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
