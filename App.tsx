
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisReport, ReviewType } from './types';
import { analyzeDesign } from './services/geminiService';
import Header from './components/Header';
import AuthPage from './components/pages/AuthPage';
import Dashboard from './components/pages/Dashboard';
import NewReview from './components/pages/NewReview';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';

// Mock user data
const user = {
  name: 'Demo User',
  avatar: `https://i.pravatar.cc/150?u=demo-user`,
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'auth' | 'home' | 'new-review' | 'loading' | 'report'>('auth');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const navigateToNewReview = () => setCurrentPage('new-review');

  const handleSubmit = useCallback(async (
    image: { data: string; mimeType: string },
    reviewType: ReviewType,
    inputValue: string,
    inputType: 'URL' | 'Image'
  ) => {
    setCurrentPage('loading');
    setError(null);
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
      };
      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      setCurrentPage('report');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred during analysis.');
      setCurrentPage('home');
    }
  }, []);

  const handleViewReport = (report: AnalysisReport) => {
    setSelectedReport(report);
    setCurrentPage('report');
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <AuthPage onLogin={handleLogin} />;
    }
    switch (currentPage) {
      case 'home':
        return <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} error={error} />;
      case 'new-review':
        return <NewReview onSubmit={handleSubmit} error={error} />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return selectedReport ? <ReportPage report={selectedReport} onBack={navigateToHome} /> : <Dashboard reports={reports} onViewReport={handleViewReport} onSubmit={handleSubmit} error={error} />;
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

export default App;
