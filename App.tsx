
import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisReport, ReviewType } from './types';
import { analyzeDesign } from './services/geminiService';
import Header from './components/Header';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';
import ProfileDashboardPage from './components/pages/SettingsPage';
import PricingPage from './components/pages/PricingPage';
import AccessDeniedPage from './components/pages/AccessDeniedPage';
import Footer from './components/Footer';
import ScreenshotFallbackModal from './components/pages/ScreenshotFallbackModal';
import UpgradeModal from './components/pages/UpgradeModal';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { simpleHash, urlToDataUrl, fileToDataUrl, resizeImage } from './utils';

// --- App-level State Types ---
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}
export interface NotificationSettings {
  emailOnComplete: boolean;
  slackOnComplete: boolean;
  emailWeekly: boolean;
  productUpdates: boolean;
}

// FIX: Added missing ReviewSettings interface to resolve import error in ReviewSettingsPanel.tsx.
export interface ReviewSettings {
  uiStrictness: 'Soft' | 'Balanced' | 'Strict';
  uxStrictness: 'Soft' | 'Balanced' | 'Strict';
  tone: 'Friendly' | 'Professional' | 'Direct';
  reportFormat: boolean;
}

export type DashboardTab = 'profile' | 'billing' | 'reviews' | 'notifications' | 'security' | 'help';
export type Theme = 'light' | 'dark' | 'system';
export type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report' | 'dashboard' | 'pricing' | 'access-denied'>('auth');
  const [initialDashboardTab, setInitialDashboardTab] = useState<DashboardTab>('profile');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const { addToast } = useToast();

  const [screenshotFailureInfo, setScreenshotFailureInfo] = useState<{ reason: string; url: string; reviewType: ReviewType } | null>(null);
  const [urlSubmissionError, setUrlSubmissionError] = useState<{ url: string; reviewType: ReviewType; reason: string } | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // --- State for User and Settings ---
  const [user, setUser] = useState<UserProfile>({
    name: 'Demo User',
    email: 'demo@uxray.ai',
    avatar: `https://i.pravatar.cc/150?u=demo-user`,
  });
  
  const [userPlan, setUserPlan] = useState({
    name: 'Hobby',
    reviewsUsed: 0,
    reviewsLimit: 5,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailOnComplete: true,
    slackOnComplete: false,
    emailWeekly: false,
    productUpdates: true,
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  // Effect to handle theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            root.classList.toggle('dark', mediaQuery.matches);
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
}, [theme]);


  // --- Handlers for State Updates ---
  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };
  
  const handleUpdateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...updates }));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('auth');
    setReports([]);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setUrlSubmissionError(null);
  }
  const navigateToPricing = () => setCurrentPage('pricing');

  const navigateToDashboard = (tab: DashboardTab = 'profile') => {
    setInitialDashboardTab(tab);
    setCurrentPage('dashboard');
  };

  const handleViewReport = (report: AnalysisReport) => {
    setSelectedReport(report);
    setCurrentPage('report');
  };
  
  // Core analysis logic, extracted for reusability
  const runAnalysisAndDisplayReport = useCallback(async (
    image: { data: string, mimeType: string },
    reviewType: ReviewType,
    inputType: 'URL' | 'Image',
    inputValue: string,
    ignoreCache: boolean
  ): Promise<boolean> => {
    const resizedImage = await resizeImage(image.data, image.mimeType);

    const cacheKey = `report-cache-${reviewType}-${simpleHash(resizedImage.data)}`;
    
    if (!ignoreCache) {
        const cachedReportJSON = localStorage.getItem(cacheKey);
        if (cachedReportJSON) {
          const cachedReport: AnalysisReport = JSON.parse(cachedReportJSON);
          setSelectedReport(cachedReport);
          setCurrentPage('report');
          addToast('Loaded report from cache.', 'success');
          if (!reports.some(r => r.id === cachedReport.id)) {
            setReports(prev => [cachedReport, ...prev]);
          }
          return false; // End here for cache hit
        }
    }

    const result = await analyzeDesign(resizedImage, reviewType);

    const newReport: AnalysisReport = {
      id: new Date().toISOString(),
      user_id: 'demo-user',
      input_type: inputType,
      input_value: inputValue,
      ui_score: result.uiScore,
      ux_score: result.uxScore,
      result_json: result,
      created_at: new Date().toISOString(),
      screenshot_url: resizedImage.data,
      review_type: reviewType,
    };

    localStorage.setItem(cacheKey, JSON.stringify(newReport));

    setReports(prev => [newReport, ...prev]);
    setSelectedReport(newReport);
    setCurrentPage('report');
    addToast('Analysis complete! Report successfully generated.', 'success');
    return true;
  }, [addToast, reports]);


  const handleSubmit = useCallback(async (
    submission: Submission,
    reviewType: ReviewType,
    ignoreCache: boolean,
    attemptFullPage: boolean
  ) => {
    if (userPlan.reviewsUsed >= userPlan.reviewsLimit) {
        navigateToPricing();
        return;
    }

    setCurrentPage('loading');
    setScreenshotFailureInfo(null);
    setUrlSubmissionError(null);
    
    try {
        let image: { data: string, mimeType: string, name?: string };
        let inputType: 'URL' | 'Image';
        let inputValue: string;

        if (submission.type === 'URL') {
            image = await urlToDataUrl(submission.value, attemptFullPage);
            inputType = 'URL';
            inputValue = submission.value;
        } else {
            image = await fileToDataUrl(submission.value);
            inputType = 'Image';
            inputValue = image.name || 'Uploaded Image';
        }

        const isNewAnalysis = await runAnalysisAndDisplayReport(
            image,
            reviewType,
            inputType,
            inputValue,
            ignoreCache,
        );

        if (isNewAnalysis) {
            setUserPlan(prev => ({...prev, reviewsUsed: prev.reviewsUsed + 1}));
        }

    } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || 'An unknown error occurred.';
        
        if (submission.type === 'URL') {
            // Unify all URL-based errors to show the special error page.
            setUrlSubmissionError({
                url: submission.value,
                reviewType,
                reason: errorMessage,
            });
            setCurrentPage('access-denied');
        } else {
            // For direct image uploads, also show the error page for consistency.
            if (err.message.includes('not appear to be a website')) {
                setUrlSubmissionError({
                    url: (submission.value as File).name,
                    reviewType,
                    reason: errorMessage,
                });
                setCurrentPage('access-denied');
            } else {
                addToast(errorMessage, 'error');
                setCurrentPage('home');
            }
        }
    }
  }, [addToast, runAnalysisAndDisplayReport, userPlan]);

  const handleManualUploadRequest = () => {
    if (urlSubmissionError) {
      setScreenshotFailureInfo({
        reason: urlSubmissionError.reason,
        url: urlSubmissionError.url,
        reviewType: urlSubmissionError.reviewType,
      });
       setUrlSubmissionError(null); // Clear the error page state
       setCurrentPage('home'); // Go back to home to show the modal over the dashboard
    }
  };


  const handleFallbackSubmit = (manualFile: File) => {
    if (screenshotFailureInfo) {
      if (userPlan.reviewsUsed >= userPlan.reviewsLimit) {
        setScreenshotFailureInfo(null);
        setIsUpgradeModalOpen(true);
        return;
      }
      const { reviewType, url } = screenshotFailureInfo;
      setCurrentPage('loading');
      setScreenshotFailureInfo(null);
      fileToDataUrl(manualFile).then(image => {
        runAnalysisAndDisplayReport(image, reviewType, 'URL', url, true).then(isNew => {
            if (isNew) setUserPlan(prev => ({...prev, reviewsUsed: prev.reviewsUsed + 1}));
        });
      }).catch(err => {
        addToast('Failed to process the uploaded file.', 'error');
        setCurrentPage('home');
      });
    }
  };
  
  const renderContent = () => {
    if (currentPage === 'auth' && !isLoggedIn) {
       return <AuthPage onLogin={handleLogin} />;
    }
    
    switch (currentPage) {
      case 'home':
        return <Dashboard 
                  reports={reports}
                  onViewReport={handleViewReport}
                  onSubmit={handleSubmit}
                  userPlan={userPlan}
                />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return selectedReport ? <ReportPage report={selectedReport} onBack={navigateToHome} /> : <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} userPlan={userPlan} />;
      case 'dashboard':
        return <ProfileDashboardPage 
                  user={user} 
                  onUpdateUser={handleUpdateUser}
                  notificationSettings={notificationSettings}
                  onUpdateNotificationSettings={handleUpdateNotificationSettings}
                  onLogout={handleLogout} 
                  initialTab={initialDashboardTab}
                  reports={reports}
                  onViewReport={handleViewReport}
                  currentUserPlan={userPlan}
                  onNavigateToPricing={navigateToPricing}
                />;
      case 'pricing':
        return <PricingPage onBack={navigateToHome} />;
      case 'access-denied':
        return urlSubmissionError ? 
            <AccessDeniedPage 
                onBack={navigateToHome} 
                onUploadManually={handleManualUploadRequest}
                reason={urlSubmissionError.reason}
            /> :
            <Dashboard 
                reports={reports}
                onViewReport={handleViewReport}
                onSubmit={handleSubmit}
                userPlan={userPlan}
              />;
      default:
        return <AuthPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="font-sans text-text-primary dark:text-gray-300 min-h-screen flex flex-col">
      {isLoggedIn && <Header user={user} onLogout={handleLogout} onNavigateHome={navigateToHome} onNavigateToDashboard={navigateToDashboard} onNavigateToPricing={navigateToPricing} theme={theme} setTheme={setTheme} />}
      <main className="flex-grow pt-16">
          {renderContent()}
      </main>
      {isLoggedIn && <Footer />}
      {screenshotFailureInfo && (
        <ScreenshotFallbackModal
          isOpen={!!screenshotFailureInfo}
          onClose={() => setScreenshotFailureInfo(null)}
          onSubmit={handleFallbackSubmit}
          url={screenshotFailureInfo.url}
          reason={screenshotFailureInfo.reason}
        />
      )}
       <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={() => {
          navigateToPricing();
          setIsUpgradeModalOpen(false);
        }}
        userPlan={userPlan}
      />
    </div>
  );
};


const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);


export default App;
