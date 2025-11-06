import React, { useState } from 'react';
import { AnalysisReport, AnalysisIssue } from '../../types';

type Tab = 'UI' | 'UX';

const ScoreCard: React.FC<{ score: number; label: string; summary: string }> = ({ score, label, summary }) => {
    const getTextColor = (s: number) => {
        if (s >= 85) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };
    const getBgColor = (s: number) => {
        if (s >= 85) return 'bg-green-50';
        if (s >= 60) return 'bg-yellow-50';
        return 'bg-red-50';
    };

    return (
        <div className={`p-6 rounded-2xl shadow-soft flex-1 bg-white border border-gray-200/60`}>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className={`flex-shrink-0 text-5xl font-bold ${getTextColor(score)}`}>
                    {score}
                    <span className="text-2xl text-gray-400">/100</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-primary">{label} Score</h3>
                    <p className="text-text-secondary mt-1">{summary}</p>
                </div>
            </div>
        </div>
    );
};

const IssueCard: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => {
    const getSeverityPill = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'major': return 'bg-yellow-100 text-yellow-800';
            case 'minor': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    return (
        <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-200/60">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-text-primary">{issue.issueTitle}</h4>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getSeverityPill(issue.severity)}`}>{issue.severity}</span>
            </div>
            {issue.relevantLaw && <p className="text-sm font-medium text-primary mb-2">{issue.relevantLaw}</p>}
            <p className="text-text-secondary mb-3">{issue.issueDescription}</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200/80">
                <p className="text-sm font-semibold text-green-700">Recommendation:</p>
                <p className="text-sm text-text-secondary mt-1">{issue.recommendation}</p>
            </div>
        </div>
    );
};


const ReportPage: React.FC<{ report: AnalysisReport; onBack: () => void }> = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('UI');
  const { result_json: results, screenshot_url } = report;

  const analysisData = activeTab === 'UI' ? results.uiAnalysis : results.uxAnalysis;
  const hasUiIssues = results.uiAnalysis && results.uiAnalysis.length > 0;
  const hasUxIssues = results.uxAnalysis && results.uxAnalysis.length > 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary mb-6 font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Home
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
            <div className="sticky top-28">
                <h2 className="text-2xl font-bold mb-4">Design Preview</h2>
                <img src={screenshot_url} alt="Analyzed Screenshot" className="rounded-2xl shadow-form-soft w-full border border-gray-200/80" />
                <div className="mt-6 bg-white p-5 rounded-2xl shadow-soft border border-gray-200/60">
                    <h3 className="font-bold text-lg mb-3">Overall Summary</h3>
                    <p className="text-text-secondary">{results.overallSummary}</p>
                </div>
            </div>
        </div>
        <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
                <ScoreCard score={results.uiScore} label="UI" summary="Visual design & aesthetics." />
                <ScoreCard score={results.uxScore} label="UX" summary="Usability & user experience." />
            </div>
            
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        {hasUiIssues && <button onClick={() => setActiveTab('UI')} className={`${activeTab === 'UI' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>UI Analysis</button>}
                        {hasUxIssues && <button onClick={() => setActiveTab('UX')} className={`${activeTab === 'UX' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>UX Analysis</button>}
                    </nav>
                </div>
            </div>

            <div className="space-y-5">
                {analysisData.length > 0 ? analysisData.map((issue, index) => (
                    <IssueCard key={index} issue={issue} />
                )) : <p className="text-center py-8 text-text-secondary">No issues found for this category.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;