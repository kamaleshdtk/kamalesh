import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import ReportCard from '../shared/ReportCard';
import { useToast } from '../../contexts/ToastContext';

type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

interface DashboardProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onSubmit: (submission: Submission, reviewType: ReviewType, ignoreCache: boolean) => void;
}

const AnalysisForm: React.FC<{
    onSubmit: DashboardProps['onSubmit'];
}> = ({ onSubmit }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<ReviewType>(ReviewType.UI);
  const [ignoreCache, setIgnoreCache] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const isValidUrl = (urlString: string): boolean => {
    try {
        if (!/\./.test(urlString) || urlString.endsWith('.')) return false;
        new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
        return true;
    } catch (e) {
        return false;
    }
  };


  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 15 * 1024 * 1024) { // 15MB limit
        addToast("File size exceeds 15MB. Please upload a smaller image.", 'error');
        return;
      }
      setImageFile(file);
      setUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Allows re-uploading the same file
      }
    }
  }, [addToast]);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(imageFile) {
        setImageFile(null);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !url) {
      addToast('Please upload an image or enter a URL.', 'error');
      return;
    }

    if (url && !isValidUrl(url)) {
        addToast('Please enter a valid URL.', 'error');
        return;
    }
    
    if (imageFile) {
        onSubmit({ type: 'Image', value: imageFile }, analysisType, ignoreCache);
    } else if (url) {
        onSubmit({ type: 'URL', value: url }, analysisType, ignoreCache);
    }
  };
  
  return (
    <div className="max-w-4xl w-full mx-auto mt-12">
        <form onSubmit={handleFormSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                    <div className="flex items-center gap-3 w-full md:flex-grow">
                        {/* Upload Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label="Upload image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

                        {/* URL Input */}
                        <input
                            type="text"
                            value={imageFile ? imageFile.name : url}
                            onChange={handleUrlChange}
                            readOnly={!!imageFile}
                            placeholder="Paste a URL or Figma link, or click '+' to upload an image"
                            className="flex-grow w-full text-base bg-transparent text-text-primary dark:text-white focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        {/* Analysis Type Toggle */}
                        <button
                            type="button"
                            onClick={() => setAnalysisType(ReviewType.UI)}
                            className={`flex-1 md:flex-initial px-5 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
                                analysisType === ReviewType.UI
                                    ? 'bg-primary text-white shadow'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/70'
                            }`}
                        >
                        UI Analyze
                        </button>
                        <button
                            type="button"
                            onClick={() => setAnalysisType(ReviewType.UX)}
                            className={`flex-1 md:flex-initial px-5 py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
                                analysisType === ReviewType.UX
                                    ? 'bg-primary text-white shadow'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/70'
                            }`}
                        >
                        UX Analyze
                        </button>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!imageFile && !url}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Submit for analysis"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
             <div className="mt-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 px-2">
                <p className="text-xs text-text-secondary dark:text-gray-500 text-center sm:text-left">
                    <strong>Pro Tip:</strong> URL analysis captures the visible area. For a full top-to-bottom review, upload an image.
                </p>
                <label className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 cursor-pointer flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={ignoreCache}
                        onChange={(e) => setIgnoreCache(e.target.checked)}
                        className="appearance-none h-4 w-4 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700
                                   checked:bg-primary checked:border-transparent
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900
                                   checked:bg-[url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27white%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')]
                                   checked:bg-center checked:bg-no-repeat"
                    />
                    Re-analyze (ignore cache)
                </label>
            </div>
        </form>
    </div>
  )
}


const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-text-primary dark:text-white">
                Get Instant UI & UX Feedback
            </h1>
            <p className="mt-6 text-md sm:text-lg lg:text-xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto">
                Upload a screenshot or paste a URL to have your design analyzed by our expert AI in seconds. Stop guessing, start improving.
            </p>
            <AnalysisForm onSubmit={onSubmit} />
          </div>
      </div>

      {/* History Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Analysis History</h2>
        </div>
        {reports.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedReports.map(report => (
                    <ReportCard key={report.id} report={report} onView={onViewReport} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                currentPage === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&gt;</button>
                </div>
            )}
          </>
        ) : (
             <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
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