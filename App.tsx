import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisReport, ReviewType, GuidelinePreset } from './types';
import { analyzeDesign } from './services/geminiService';
import Header from './components/Header';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';
import ProfileDashboardPage from './components/pages/SettingsPage';
import PricingPage from './components/pages/PricingPage';
import AccessDeniedPage from './components/pages/AccessDeniedPage';
import TeamPage from './components/pages/TeamPage';
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
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report' | 'dashboard' | 'pricing' | 'access-denied' | 'team'>('auth');
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
    email: 'demo@designaudit.ai',
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
  const navigateToTeam = () => setCurrentPage('team');

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
    ignoreCache: boolean,
    guideline: GuidelinePreset
  ): Promise<boolean> => {
    const resizedImage = await resizeImage(image.data, image.mimeType);

    const cacheKey = `report-cache-${reviewType}-${guideline}-${simpleHash(resizedImage.data)}`;
    
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

    const result = await analyzeDesign(resizedImage, reviewType, guideline);

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
      guideline_preset: guideline,
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
    ignoreCache: boolean
  ) => {
    if (userPlan.reviewsUsed >= userPlan.reviewsLimit) {
        setIsUpgradeModalOpen(true);
        return;
    }

    setCurrentPage('loading');
    setScreenshotFailureInfo(null);
    setUrlSubmissionError(null);
    
    try {
        let image: { data: string, mimeType: string, name?: string };
        let inputType: 'URL' | 'Image';
        let inputValue: string;
        const isUrlSubmission = submission.type === 'URL';

        if (isUrlSubmission) {
            image = await urlToDataUrl(submission.value, true); // Always true for URL submissions now
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
            'General',
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
                addToast(`Analysis failed: ${errorMessage}`, 'error');
                setCurrentPage('home');
            }
        }
    }
  }, [runAnalysisAndDisplayReport, userPlan, addToast]);

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <AuthPage onLogin={handleLogin} />;
      case 'home':
        return <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} userPlan={userPlan} />;
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
            initialTab={initialDashboardTab} 
            onLogout={handleLogout} 
            reports={reports}
            onViewReport={handleViewReport}
            currentUserPlan={userPlan}
            onNavigateToPricing={navigateToPricing}
        />;
      case 'pricing':
        return <PricingPage onBack={navigateToHome} />;
      case 'team':
        return <TeamPage onBack={navigateToHome} />;
      case 'access-denied':
        return urlSubmissionError ? 
            <AccessDeniedPage 
                onBack={navigateToHome} 
                onUploadManually={() => {
                    if (urlSubmissionError) {
                        setScreenshotFailureInfo({
                            url: urlSubmissionError.url,
                            reviewType: urlSubmissionError.reviewType,
                            reason: urlSubmissionError.reason,
                        });
                        setCurrentPage('home');
                    }
                }} 
                reason={urlSubmissionError.reason} 
            /> : <AccessDeniedPage onBack={navigateToHome} onUploadManually={() => {}} />;
      default:
        return <AuthPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {isLoggedIn && (
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onNavigateHome={navigateToHome} 
          onNavigateToDashboard={navigateToDashboard}
          onNavigateToPricing={navigateToPricing}
          theme={theme}
          setTheme={setTheme}
        />
      )}
      <main className={`flex-grow flex flex-col ${isLoggedIn ? 'pt-[62px]' : ''}`}>
        {renderPage()}
      </main>
      {isLoggedIn && currentPage !== 'report' && currentPage !== 'auth' && <Footer onNavigateToTeam={navigateToTeam} />}

      <ScreenshotFallbackModal
        isOpen={!!screenshotFailureInfo}
        onClose={() => setScreenshotFailureInfo(null)}
        onSubmit={async (file) => {
            if (screenshotFailureInfo) {
                await handleSubmit({ type: 'Image', value: file }, screenshotFailureInfo.reviewType, false);
                setScreenshotFailureInfo(null);
            }
        }}
        url={screenshotFailureInfo?.url || ''}
        reason={screenshotFailureInfo?.reason}
      />
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={() => {
          setIsUpgradeModalOpen(false);
          navigateToPricing();
        }}
        userPlan={userPlan}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;