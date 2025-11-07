
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisReport, ReviewType } from './types';
import { analyzeDesign } from './services/geminiService';
import Header from './components/Header';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';
import HistoryPage from './components/pages/HistoryPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { simpleHash } from './utils';

// Mock user data
const user = {
  name: 'Demo User',
  avatar: `https://i.pravatar.cc/150?u=demo-user`,
};

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report' | 'history'>('auth');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      const storedReports = localStorage.getItem('uxray-reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    } catch (e) {
      console.error("Failed to parse reports from localStorage", e);
      setReports([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('uxray-reports', JSON.stringify(reports));
    } catch (e) {
      console.error("Failed to save reports to localStorage", e);
    }
  }, [reports]);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('auth');
  };

  const navigateToHome = () => setCurrentPage('home');
  const navigateToNewReview = () => setCurrentPage('home');
  const navigateToHistory = () => setCurrentPage('history');

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
  }, [addToast]);

  const handleViewReport = (report: AnalysisReport) => {
    setSelectedReport(report);
    setCurrentPage('report');
  };

  const renderContent = () => {
    if (currentPage === 'auth' && !isLoggedIn) {
       return <AuthPage onLogin={handleLogin} />;
    }
    
    switch (currentPage) {
      case 'home':
        return <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} onNavigateToHistory={navigateToHistory} />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return selectedReport ? <ReportPage report={selectedReport} onBack={navigateToHome} /> : <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} onNavigateToHistory={navigateToHistory} />;
      case 'history':
        return <HistoryPage reports={reports} onViewReport={handleViewReport} onBack={navigateToHome} />;
      default:
        return <AuthPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="font-sans text-text-primary min-h-screen">
      {isLoggedIn && <Header user={user} onLogout={handleLogout} onNavigateHome={navigateToHome} onNavigateToNewReview={navigateToNewReview} onNavigateToHistory={navigateToHistory} />}
      <main className="pt-28 sm:pt-32">
          {renderContent()}
      </main>
    </div>
  );
};


const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);


export default App;
