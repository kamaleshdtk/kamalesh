
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisReport, ReviewType } from './types';
import { analyzeDesign } from './services/geminiService';
import Header from './components/Header';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { decodeReportData } from './utils';

// Mock user data
const user = {
  name: 'Demo User',
  avatar: `https://i.pravatar.cc/150?u=demo-user`,
};

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'loading' | 'report'>('auth');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const { addToast } = useToast();

  // Handle shared report links on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportData = urlParams.get('report');
    if (reportData) {
        // Clear the URL parameter to avoid reprocessing on re-render
        window.history.replaceState({}, document.title, window.location.pathname);
        const decodedReport = decodeReportData(reportData);
        if (decodedReport) {
            setSelectedReport(decodedReport);
            setIsLoggedIn(true); // Show header for shared reports
            setCurrentPage('report');
        } else {
            addToast('The shared report link is invalid or corrupted.', 'error');
            // Fall back to the auth page
            setCurrentPage('auth');
        }
    }
  }, [addToast]);


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

  const handleSubmit = useCallback(async (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image'
  ) => {
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
        return <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return selectedReport ? <ReportPage report={selectedReport} onBack={navigateToHome} /> : <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} />;
      default:
        return <AuthPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="font-sans text-text-primary min-h-screen">
      {isLoggedIn && <Header user={user} onLogout={handleLogout} onNavigateHome={navigateToHome} onNavigateToNewReview={navigateToNewReview} />}
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