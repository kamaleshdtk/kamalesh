import React, { useState, useRef, useCallback, ChangeEvent, useEffect, useMemo } from 'react';
import { AnalysisReport, ReviewType, GuidelinePreset } from '../../types';
import ReportCard from '../shared/ReportCard';
import { useToast } from '../../contexts/ToastContext';
import { getDisplayName, fileToDataUrl, dataUrlToFile } from '../../utils';

type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

interface DashboardProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onSubmit: (submission: Submission, reviewType: ReviewType, ignoreCache: boolean) => void;
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

  // Restore session from localStorage
  useEffect(() => {
    const savedDraftJSON = localStorage.getItem('designAudit-draft');
    if (savedDraftJSON) {
      try {
        const savedDraft = JSON.parse(savedDraftJSON);
        if (savedDraft.url) {
          setUrl(savedDraft.url);
        } else if (savedDraft.image) {
          const file = dataUrlToFile(savedDraft.image.data, savedDraft.image.name);
          if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
          }
        }
        if (savedDraft.analysisType) {
          setAnalysisType(savedDraft.analysisType);
        }
        addToast('Restored your previous session!', 'success');
      } catch (error) {
        console.error('Failed to parse saved draft:', error);
        localStorage.removeItem('designAudit-draft');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToast]);

  // Save session to localStorage
  useEffect(() => {
    const saveDraft = async () => {
      try {
        if (imageFile) {
          const imageData = await fileToDataUrl(imageFile);
          const draft = {
            image: {
              data: imageData.data,
              name: imageData.name,
              mimeType: imageData.mimeType,
            },
            url: '',
            analysisType,
          };
          try {
            localStorage.setItem('designAudit-draft', JSON.stringify(draft));
          } catch (e: any) {
            // Check for QuotaExceededError across browsers
            if (e.name === 'QuotaExceededError' || (e.code && (e.code === 22 || e.code === 1014))) {
              console.warn("Could not save draft to localStorage: Quota exceeded.");
              addToast("Draft could not be saved because the image is too large.", 'error');
              localStorage.removeItem('designAudit-draft'); // Clean up any partial save
            } else {
              // Re-throw other errors to be caught by the outer catch
              throw e;
            }
          }
        } else if (url) {
          const draft = {
            image: null,
            url,
            analysisType,
          };
          localStorage.setItem('designAudit-draft', JSON.stringify(draft));
        } else {
          localStorage.removeItem('designAudit-draft');
        }
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    };
    
    saveDraft();
  }, [imageFile, url, analysisType, addToast]);

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
        onSubmit({ type: 'Image', value: imageFile }, analysisType, ignoreCache);
    } else if (url) {
        onSubmit({ type: 'URL', value: url }, analysisType, ignoreCache);
    }
    localStorage.removeItem('designAudit-draft');
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
                            title="Upload image"
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
                              <label htmlFor="url-input" className="sr-only">Paste a URL or Figma link</label>
                              <input
                                  id="url-input"
                                  type="text"
                                  value={url}
                                  onChange={handleUrlChange}
                                  placeholder="Paste a URL or click '+' to upload an image"
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
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.5 17.25l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 13.5l.398 1.197a3.375 3.375 0 002.456 2.456l1.197.398-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-4 px-2">
                {!!url && (
                    <p className="text-xs text-text-secondary dark:text-gray-500 mr-auto">
                      <strong>Note:</strong> URL analysis now automatically captures the full page.
                    </p>
                )}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="relative group flex items-center gap-1.5">
                        <label className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 cursor-help">
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded-lg py-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
                           Force a new analysis, even if a report for this image or URL already exists in the cache.
                           <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
  );
};

{/* FIX: Add the missing Dashboard component definition and default export */}
const Dashboard: React.FC<DashboardProps> = ({ reports, onViewReport, onSubmit, userPlan }) => {
    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [reports]);

    return (
        <div className={`flex-grow flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 ${sortedReports.length === 0 ? 'justify-center' : ''}`}>
            <div className="text-center pt-32 sm:pt-40 pb-8 sm:pb-12">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-text-primary dark:text-white">
                        Get Instant UI & UX Feedback
                    </h1>
                    <p className="mt-6 text-md sm:text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
                        Upload a screenshot or paste a URL to have your design analyzed by our expert AI in seconds. Stop guessing, start improving.
                    </p>
                    <AnalysisForm onSubmit={onSubmit} userPlan={userPlan} />
                </div>
            </div>

            {sortedReports.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-text-primary dark:text-white">Recent Analyses</h2>
                         <span className="text-sm font-medium text-text-secondary dark:text-gray-400">Showing {sortedReports.length} report{sortedReports.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedReports.map(report => (
                            <ReportCard key={report.id} report={report} onView={onViewReport} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;