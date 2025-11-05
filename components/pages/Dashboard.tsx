
import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';

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

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AnalysisForm: React.FC<{ onSubmit: DashboardProps['onSubmit'], error: DashboardProps['error'] }> = ({ onSubmit, error }) => {
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.UI);
  const [image, setImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        alert("File size exceeds 4MB. Please upload a smaller image.");
        return;
      }
      const dataUrl = await fileToDataUrl(file);
      setImage({ data: dataUrl, mimeType: file.type, name: file.name });
      setUrl('');
    }
  }, []);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(image) setImage(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (image) {
      onSubmit(image, reviewType, image.name, 'Image');
    } else if (url) {
      alert(`URL analysis is simulated. A placeholder image will be used for "${url}".`);
      const fakeScreenshot = { data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', mimeType: 'image/png' };
      onSubmit(fakeScreenshot, reviewType, url, 'URL');
    } else {
      alert('Please upload an image or enter a URL.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-3xl w-full mx-auto mt-10"
    >
      <div className="relative bg-white border border-gray-200 rounded-xl p-3 shadow-soft flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50 transition-shadow">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Upload image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

          <input
            type="text"
            value={image ? `File: ${image.name}` : url}
            onChange={handleUrlChange}
            readOnly={!!image}
            placeholder="Enter a website URL (e.g., https://example.com)"
            className="flex-grow text-sm sm:text-base bg-transparent p-2 focus:outline-none placeholder-text-secondary"
          />

          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setReviewType(ReviewType.UI)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UI ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              UI Analyze
            </button>
            <button
              type="button"
              onClick={() => setReviewType(ReviewType.UX)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UX ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              UX Analyze
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!image && !url}
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Start analysis"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
      </div>
      
      {error && <div className="text-red-600 text-sm px-3 pt-2 text-center">{error}</div>}
      
      <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
        <button
          type="button"
          onClick={() => setReviewType(ReviewType.UI)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UI ? 'bg-primary/10 text-primary' : 'bg-white border'}`}
        >
          UI Analyze
        </button>
        <button
          type="button"
          onClick={() => setReviewType(ReviewType.UX)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UX ? 'bg-primary/10 text-primary' : 'bg-white border'}`}
        >
          UX Analyze
        </button>
      </div>
    </form>
  )
}

const ScoreBadge: React.FC<{ score: number; label: string }> = ({ score, label }) => {
  const getColor = (s: number) => {
    if (s >= 85) return 'bg-green-100 text-green-800';
    if (s >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  return (
    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getColor(score)}`}>
      {label}: {score}/100
    </div>
  );
};

const ReportCard: React.FC<{report: AnalysisReport; onView: (report: AnalysisReport) => void}> = ({ report, onView }) => (
    <div 
      className="bg-white shadow-soft rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onView(report)}
    >
        <img src={report.screenshot_url} alt="Screenshot" className="w-full sm:w-32 h-auto rounded-lg object-cover border border-gray-200" />
        <div className="flex-grow">
            <p className="font-semibold text-text-primary">{report.input_value}</p>
            <p className="text-sm text-text-secondary">{new Date(report.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-row sm:flex-col items-start gap-2 mt-2 sm:mt-0">
            <ScoreBadge score={report.ui_score} label="UI" />
            <ScoreBadge score={report.ux_score} label="UX" />
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit, error }) => {
  return (
    <>
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Get Instant UI & UX Feedback
          </h1>
          <p className="mt-6 text-md sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a screenshot or paste a URL to have your design analyzed by our expert AI in seconds. Stop guessing, start improving.
          </p>
          <AnalysisForm onSubmit={onSubmit} error={error} />
        </div>
      </div>
      
      {/* Reports History Section */}
      {reports.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
           <div className="space-y-4">
              <h3 className="text-xl font-semibold text-text-primary pb-2 border-b border-gray-200 mb-4">Review History</h3>
              {reports.map(report => (
                  <ReportCard key={report.id} report={report} onView={onViewReport} />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
