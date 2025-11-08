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
import { ToastProvider, useToast } from './contexts/ToastContext';
import { simpleHash } from './utils';

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

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report' | 'dashboard' | 'pricing'>('auth');
  const [initialDashboardTab, setInitialDashboardTab] = useState<DashboardTab>('profile');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const { addToast } = useToast();
  
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

  const handleSubmit = useCallback(async (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image',
    forceRefresh: boolean
  ) => {

    const cacheKey = `report-cache-${reviewType}-${simpleHash(image.data)}`;

    if (!forceRefresh) {
        try {
            const cachedReportJSON = localStorage.getItem(cacheKey);
            if (cachedReportJSON) {
                const cachedReport: AnalysisReport = JSON.parse(cachedReportJSON);
                setSelectedReport(cachedReport);
                setCurrentPage('report');
                addToast('Loaded report from cache.', 'success');
                // Check if this report is already in our state
                if (!reports.some(r => r.id === cachedReport.id)) {
                   setReports(prev => [cachedReport, ...prev]);
                }
                return;
            }
        } catch (e) {
            console.error("Failed to read from cache", e);
        }
    }

    setCurrentPage('loading');
    try {
      const result = await analyzeDesign(image, reviewType);
      const newReport: AnalysisReport = {
        id: new Date().toISOString(),
        user_id: 'demo-user',
        input_type: inputType,
        input_value: inputValue,
        ui_score: result.uiScore,
        ux_score: result.uxScore,
        result_json: result,
        created_at: new Date().toISOString(),
        screenshot_url: image.data,
        review_type: reviewType,
      };

      // Save to cache
      try {
          localStorage.setItem(cacheKey, JSON.stringify(newReport));
      } catch(e) {
          console.error("Failed to save report to cache", e);
      }
      
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      setCurrentPage('report');
      addToast('Analysis complete! Report successfully generated.', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'An unknown error occurred during analysis.', 'error');
      setCurrentPage('home');
    }
  }, [addToast, reports]);

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
                  onBack={navigateToHome} 
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
    </div>
  );
};


const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);


export default App;