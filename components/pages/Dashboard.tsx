import React, { useState, useRef, useCallback, ChangeEvent, useEffect, useMemo } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import ReportCard from '../shared/ReportCard';
import { useToast } from '../../contexts/ToastContext';
import { getDisplayName } from '../../utils';

type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

interface DashboardProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onSubmit: (submission: Submission, reviewType: ReviewType, ignoreCache: boolean, attemptFullPage: boolean) => void;
  userPlan: { name: string; reviewsUsed: number; reviewsLimit: number; };
}

const AnalysisForm: React.FC<{
    onSubmit: DashboardProps['onSubmit'];
    userPlan: DashboardProps['userPlan'];
}> = ({ onSubmit, userPlan }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState<ReviewType>(ReviewType.UI);
  const [ignoreCache, setIgnoreCache] = useState(false);
  const [isFullPageAttempt, setIsFullPageAttempt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  
  // Effect for cleaning up the object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const isValidUrl = (urlString: string): boolean => {
    try {
        if (!/\./.test(urlString) || urlString.endsWith('.')) return false;
        new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
        return true;
    } catch (e) {
        return false;
    }
  };

  const handleRemoveImage = useCallback(() => {
    if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);


  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        addToast("Invalid file type. Please upload a PNG, JPG, or WEBP.", 'error');
        return;
      }
      if (file.size < 2048) { // 2KB minimum
        addToast("Image is too small. Please upload a larger screenshot.", 'error');
        return;
      }
      if(file.size > 15 * 1024 * 1024) { // 15MB limit
        addToast("File size exceeds 15MB. Please upload a smaller image.", 'error');
        return;
      }
      
      handleRemoveImage(); // Clear previous image if any
      
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Allows re-uploading the same file
      }
    }
  }, [addToast, handleRemoveImage]);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if(imageFile) {
        handleRemoveImage();
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
        onSubmit({ type: 'Image', value: imageFile }, analysisType, ignoreCache, false);
    } else if (url) {
        onSubmit({ type: 'URL', value: url }, analysisType, ignoreCache, isFullPageAttempt);
    }
  };
  
  return (
    <div className="w-full mt-12">
        <form onSubmit={handleFormSubmit}>
            {/* Main Input Area */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                <div className="flex flex-col md:flex-row items-center gap-3 w-full">
                    <div className="flex items-center gap-3 w-full md:flex-grow">
                        {/* Upload Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            aria-label="Upload image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />

                        {/* Conditional Input: Image Preview or URL */}
                        {imageFile && imagePreviewUrl ? (
                            <div className="flex items-center gap-2 flex-grow bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1.5 h-12">
                                <img src={imagePreviewUrl} alt="Preview" className="h-9 w-9 rounded-md object-cover flex-shrink-0" />
                                <span className="text-sm text-text-primary dark:text-gray-300 truncate flex-grow" title={imageFile.name}>{imageFile.name}</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                                    aria-label="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <>
                              <label htmlFor="url-input" className="sr-only">Paste a URL or Figma link, or click '+' to upload an image</label>
                              <input
                                  id="url-input"
                                  type="text"
                                  value={url}
                                  onChange={handleUrlChange}
                                  placeholder="Paste a URL or Figma link, or click '+' to upload an image"
                                  className="flex-grow w-full text-base bg-transparent text-text-primary dark:text-white focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
                              />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        {/* Analysis Type Toggle */}
                        <button
                            type="button"
                            onClick={() => setAnalysisType(ReviewType.UI)}
                            className={`flex-1 md:flex-initial px-5 py-3 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
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
                            className={`flex-1 md:flex-initial px-5 py-3 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
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
                            className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Submit for analysis"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <p className="text-sm text-text-secondary dark:text-gray-400 max-w-md">
                    <strong>Pro Tip:</strong> URL analysis captures the visible area. For a full top-to-bottom review, upload an image.
                </p>
                <div className="flex items-center gap-6 flex-shrink-0">
                    <label className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isFullPageAttempt}
                            onChange={(e) => setIsFullPageAttempt(e.target.checked)}
                            disabled={!!imageFile}
                            className="appearance-none h-4 w-4 border border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-700
                                    checked:bg-primary checked:border-transparent
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    checked:bg-[url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27white%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')]
                                    checked:bg-center checked:bg-no-repeat"
                        />
                        Attempt full-page analysis (Beta)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 cursor-pointer">
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
            </div>
        </form>
    </div>
  )
}

const NoResultsState: React.FC = () => (
    <div className="text-center py-10 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        <h3 className="mt-5 text-xl font-bold text-text-primary dark:text-white">No Reports Found</h3>
        <p className="mt-2 text-base text-text-secondary dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit, userPlan }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | ReviewType.UI | ReviewType.UX>('All');
  const itemsPerPage = 6;

  const filteredReports = useMemo(() => {
    return reports
        .filter(report => {
            if (filterType !== 'All' && report.review_type !== filterType) {
                return false;
            }
            if (searchTerm && !getDisplayName(report).toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            return true;
        });
  }, [reports, searchTerm, filterType]);


  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

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
            <AnalysisForm onSubmit={onSubmit} userPlan={userPlan} />
          </div>
      </div>

      {/* History Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Analysis History</h2>
            {reports.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary placeholder-gray-400 dark:placeholder-gray-500"
                      />
                       <div className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                      <button onClick={() => setFilterType('All')} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${filterType === 'All' ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}>All</button>
                      <button onClick={() => setFilterType(ReviewType.UI)} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${filterType === ReviewType.UI ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}>UI</button>
                      <button onClick={() => setFilterType(ReviewType.UX)} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${filterType === ReviewType.UX ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}>UX</button>
                    </div>
                </div>
            )}
        </div>
        {reports.length > 0 ? (
          <>
            {filteredReports.length > 0 ? (
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
                <NoResultsState />
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
