
import React, { useState, useCallback } from 'react';
import { AnalysisReport, ReviewType } from './types';
import Header from './components/Header';
import Dashboard from './components/pages/Dashboard';
import NewReview from './components/pages/NewReview';
import LoadingScreen from './components/pages/LoadingScreen';
import ReportPage from './components/pages/ReportPage';
import AuthPage from './components/pages/AuthPage';
import { analyzeDesign } from './services/geminiService';

type Page = 'auth' | 'home' | 'new_review' | 'loading' | 'report';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('auth');
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  const handleLogin = () => {
    setUser({
      name: 'Alex Doe',
      email: 'alex.doe@example.com',
      avatar: `https://i.pravatar.cc/150?u=alexdoe`,
    });
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('auth');
  };

  const startNewReview = () => {
    setCurrentPage('new_review');
    setError(null);
  };

  const handleAnalysisSubmit = useCallback(async (
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
        user_id: user?.email || 'guest',
        input_type: inputType,
        input_value: inputType === 'Image' ? 'Uploaded Screenshot' : inputValue,
        ui_score: result.uiScore,
        ux_score: result.uxScore,
        result_json: result,
        created_at: new Date().toISOString(),
        screenshot_url: image.data,
      };
      setReports(prev => [newReport, ...prev]);
      setActiveReport(newReport);
      setCurrentPage('report');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('An error occurred during the analysis. Please try again.');
      // Go back to the page the user was on
      if(inputType === 'URL' || inputType === 'Image') {
        setCurrentPage('home');
      } else {
        setCurrentPage('new_review');
      }
    }
  }, [user]);

  const viewReport = (report: AnalysisReport) => {
    setActiveReport(report);
    setCurrentPage('report');
  };

  const navigateToHome = () => {
    setActiveReport(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <AuthPage onLogin={handleLogin} />;
      case 'home':
        return <Dashboard 
                  reports={reports} 
                  onViewReport={viewReport} 
                  onSubmit={handleAnalysisSubmit}
                  error={error} 
                />;
      case 'new_review':
        return <NewReview onSubmit={handleAnalysisSubmit} error={error} />;
      case 'loading':
        return <LoadingScreen />;
      case 'report':
        return activeReport ? <ReportPage report={activeReport} onBack={navigateToHome} /> : <Dashboard reports={reports} onViewReport={viewReport} onSubmit={handleAnalysisSubmit} error={error} />;
      default:
        return <Dashboard reports={reports} onViewReport={viewReport} onSubmit={handleAnalysisSubmit} error={error} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-text-primary">
      {user && (
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onNavigateToHome={navigateToHome}
          onNavigateToNewReview={startNewReview}
          currentPage={currentPage}
        />
      )}
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
