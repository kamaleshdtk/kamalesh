
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
      className="bg-white shadow-soft rounded-xl p-3 max-w-2xl w-full mx-auto mt-10"
    >
      <input
        type="text"
        value={image ? `File: ${image.name}` : url}
        onChange={handleUrlChange}
        readOnly={!!image}
        placeholder="Enter a website URL (e.g., https://example.com)"
        className="w-full text-base bg-transparent p-3 focus:outline-none placeholder-text-secondary"
      />
      
      {error && <div className="text-red-600 text-sm px-3 pb-2">{error}</div>}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-2 p-1 gap-4 sm:gap-2">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            aria-label="Upload image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReviewType(ReviewType.UI)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UI ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            UI Analyze
          </button>
          <button
            type="button"
            onClick={() => setReviewType(ReviewType.UX)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${reviewType === ReviewType.UX ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            UX Analyze
          </button>
          <button
            type="submit"
            disabled={!image && !url}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-light disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Start analysis"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8" />
            </svg>
          </button>
        </div>
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
      <div className="text-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary">
            Get Instant UI & UX Feedback
          </h1>
          <p className="mt-6 text-lg text-text-secondary">
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
