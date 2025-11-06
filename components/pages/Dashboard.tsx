
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { fileToDataUrl, urlToDataUrl } from '../../utils';

interface DashboardProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onSubmit: (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image'
  ) => void;
  error: string | null;
}

const AnalysisForm: React.FC<{ onSubmit: DashboardProps['onSubmit'], error: DashboardProps['error'] }> = ({ onSubmit, error }) => {
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.UI);
  const [image, setImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        setFormError("File size exceeds 4MB. Please upload a smaller image.");
        return;
      }
      setFormError(null);
      const imageData = await fileToDataUrl(file);
      setImage(imageData);
      setUrl('');
    }
  }, []);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(image) setImage(null);
    setFormError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image && !url) {
      setFormError('Please upload an image or enter a URL.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (image) {
        onSubmit(image, reviewType, image.name, 'Image');
      } else if (url) {
        const screenshot = await urlToDataUrl(url);
        onSubmit(screenshot, reviewType, url, 'URL');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unknown error occurred.');
      setIsSubmitting(false);
    }
  };
  
  const analysisInProgress = isSubmitting || !!error;

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
            disabled={analysisInProgress}
            placeholder="Enter a website URL ( e.g., https://example.com)"
            className="w-full text-base bg-transparent focus:outline-none placeholder-gray-500 px-2 pt-2 disabled:opacity-50"
          />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

        <div className="flex flex-wrap justify-between items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={analysisInProgress}
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
                disabled={analysisInProgress}
                className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewType === ReviewType.UI ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-100 text-gray-600 font-medium hover:bg-gray-200'}`}
              >
                UI Analyze
              </button>
              <button
                type="button"
                onClick={() => setReviewType(ReviewType.UX)}
                disabled={analysisInProgress}
                className={`px-4 py-2 text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${reviewType === ReviewType.UX ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'bg-gray-100 text-gray-600 font-medium hover:bg-gray-200'}`}
              >
                UX Analyze
              </button>
               <button
                  type="submit"
                  disabled={!image && !url || analysisInProgress}
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
      
      {(formError || error) && <div className="text-red-600 text-sm px-3 pt-2 text-center">{formError || error}</div>}
      
    </form>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ReportCard: React.FC<{report: AnalysisReport; onView: (report: AnalysisReport) => void}> = ({ report, onView }) => (
    <button
      className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden text-left w-full"
      onClick={() => onView(report)}
    >
        <div className="h-48 bg-gray-100">
            <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
            <p className="font-bold text-gray-800 truncate" title={report.input_value}>
              {report.input_value}
            </p>
            <p className="text-sm text-gray-500 mt-1.5">{formatDate(report.created_at)}</p>
            <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  UI: {report.ui_score}/100
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                  UX: {report.ux_score}/100
                </span>
            </div>
        </div>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit, error }) => {
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
          <AnalysisForm onSubmit={onSubmit} error={error} />
        </div>
      </div>
      
      {/* Reports History Section */}
      {reports.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-text-primary">Analyze History</h3>
              <button className="text-sm font-medium text-primary hover:underline">
                  View all >
              </button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.slice(0, 3).map(report => (
                  <ReportCard key={report.id} report={report} onView={onViewReport} />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
