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
import Footer from './components/Footer';
import ScreenshotFallbackModal from './components/pages/ScreenshotFallbackModal';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { simpleHash, urlToDataUrl, fileToDataUrl, resizeImage } from './utils';

// --- App-level State Types ---
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}
export interface ReviewSettings {
  uiStrictness: 'Soft' | 'Balanced' | 'Strict';
  uxStrictness: 'Soft' | 'Balanced' | 'Strict';
  tone: 'Friendly' | 'Professional' | 'Direct';
  reportFormat: boolean; // true for Detailed, false for Summary
}
export interface NotificationSettings {
  emailOnComplete: boolean;
  slackOnComplete: boolean;
  emailWeekly: boolean;
  productUpdates: boolean;
}


// Mock user plan data
const userPlan = {
  name: 'Hobby',
  reviewsUsed: 0,
  reviewsLimit: 5,
};

export type DashboardTab = 'profile' | 'billing' | 'reviews' | 'review-settings' | 'notifications' | 'security' | 'help';
export type Theme = 'light' | 'dark' | 'system';
type Submission = { type: 'URL'; value: string } | { type: 'Image'; value: File };

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report' | 'dashboard' | 'pricing'>('auth');
  const [initialDashboardTab, setInitialDashboardTab] = useState<DashboardTab>('profile');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const { addToast } = useToast();

  const [screenshotFailureInfo, setScreenshotFailureInfo] = useState<{ reason: string; url: string; reviewType: ReviewType } | null>(null);
  
  // --- State for User and Settings ---
  const [user, setUser] = useState<UserProfile>({
    name: 'Demo User',
    email: 'demo@uxray.ai',
    avatar: `https://i.pravatar.cc/150?u=demo-user`,
  });

  const [reviewSettings, setReviewSettings] = useState<ReviewSettings>({
    uiStrictness: 'Balanced',
    uxStrictness: 'Balanced',
    tone: 'Professional',
    reportFormat: true,
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
  
  const handleUpdateReviewSettings = (updates: Partial<ReviewSettings>) => {
    setReviewSettings(prev => ({ ...prev, ...updates }));
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

  const navigateToHome = () => setCurrentPage('home');
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
  ) => {
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
        return; // End here for cache hit
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
  }, [addToast, reports]);


  const handleSubmit = useCallback(async (
    submission: Submission,
    reviewType: ReviewType,
    ignoreCache = false
  ) => {
    setCurrentPage('loading');
    setScreenshotFailureInfo(null);
    
    try {
        let image: { data: string, mimeType: string, name?: string };
        let inputType: 'URL' | 'Image';
        let inputValue: string;

        if (submission.type === 'URL') {
            image = await urlToDataUrl(submission.value);
            inputType = 'URL';
            inputValue = submission.value;
        } else {
            image = await fileToDataUrl(submission.value);
            inputType = 'Image';
            inputValue = image.name || 'Uploaded Image';
        }

        await runAnalysisAndDisplayReport(
            image,
            reviewType,
            inputType,
            inputValue,
            ignoreCache
        );

    } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || 'An unknown error occurred.';
        addToast(errorMessage, 'error');
        setCurrentPage('home');

        if (submission.type === 'URL') {
            setScreenshotFailureInfo({ reason: errorMessage, url: submission.value, reviewType });
        }
    }
  }, [addToast, runAnalysisAndDisplayReport]);


  const handleFallbackSubmit = (manualFile: File) => {
    if (screenshotFailureInfo) {
      const { reviewType, url } = screenshotFailureInfo;
      setCurrentPage('loading');
      fileToDataUrl(manualFile).then(image => {
        runAnalysisAndDisplayReport(image, reviewType, 'URL', url, true);
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
                  onSubmit={handleSubmit}
                  reports={reports}
                  onViewReport={handleViewReport}
                  onNavigateToHistory={() => navigateToDashboard('reviews')}
                />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return selectedReport ? <ReportPage report={selectedReport} onBack={navigateToHome} /> : <Dashboard onSubmit={handleSubmit} reports={reports} onViewReport={handleViewReport} onNavigateToHistory={() => navigateToDashboard('reviews')} />;
      case 'dashboard':
        return <ProfileDashboardPage 
                  user={user} 
                  onUpdateUser={handleUpdateUser}
                  reviewSettings={reviewSettings}
                  onUpdateReviewSettings={handleUpdateReviewSettings}
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
      default:
        return <AuthPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="font-sans text-text-primary dark:text-gray-300 min-h-screen flex flex-col">
      {isLoggedIn && <Header user={user} onLogout={handleLogout} onNavigateHome={navigateToHome} onNavigateToDashboard={navigateToDashboard} onNavigateToPricing={navigateToPricing} theme={theme} setTheme={setTheme} />}
      <main className="pt-28 sm:pt-32 flex-grow">
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
    </div>
  );
};


const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);


export default App;