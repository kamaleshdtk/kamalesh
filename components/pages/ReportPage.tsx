
import React from 'react';
import { AnalysisReport, AnalysisIssue, ReviewType, CategoryAnalysis } from '../../types';
import { encodeReportData } from '../../utils';
import { useToast } from '../../contexts/ToastContext';

const ScoreCard: React.FC<{ score: number; label: string; summary: string }> = ({ score, label, summary }) => {
    const getTextColor = (s: number) => {
        if (s >= 85) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-8 rounded-2xl shadow-soft bg-white border border-gray-200/60 w-full">
            <div className="flex items-center gap-6">
                <div className={`flex-shrink-0 text-7xl font-extrabold ${getTextColor(score)}`}>
                    {score}
                    <span className="text-4xl font-semibold text-gray-400">/100</span>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-text-primary">{label}</h3>
                    <p className="text-text-secondary mt-1">{summary}</p>
                </div>
            </div>
        </div>
    );
};

const IssueCard: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => {
    const getSeverityPill = (severity: string) => {
        switch (severity?.toLowerCase()) {
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

const CategoryAnalysisCard: React.FC<{ category: CategoryAnalysis }> = ({ category }) => (
  <div className="mb-10">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h3 className="text-xl font-bold text-text-primary">{category.categoryName}</h3>
      <span className="text-lg font-bold text-gray-700">{Math.round(category.categoryScore)}/100</span>
    </div>
    <div className="space-y-5">
      {category.issues && category.issues.length > 0 ? (
        category.issues.map((issue, index) => <IssueCard key={index} issue={issue} />)
      ) : (
        <div className="text-center py-6 bg-white rounded-2xl border border-gray-200/60">
            <p className="text-text-secondary">No specific issues found in this category.</p>
        </div>
      )}
    </div>
  </div>
);


const ReportPage: React.FC<{ report: AnalysisReport; onBack: () => void }> = ({ report, onBack }) => {
  const { result_json: results, screenshot_url, review_type } = report;
  const { addToast } = useToast();

  const handleShare = () => {
    const encodedData = encodeReportData(report);
    if(encodedData) {
        const shareUrl = `${window.location.origin}${window.location.pathname}?report=${encodedData}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                addToast('Share link copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy share link: ', err);
                addToast('Failed to copy link. Please try again.', 'error');
            });
    } else {
        addToast('Could not generate share link.', 'error');
    }
  };

  const isUiReview = review_type === ReviewType.UI;
  const analysisTitle = isUiReview ? 'UI Analysis' : 'UX Analysis';
  const categoryAnalyses = isUiReview ? results.uiCategoryAnalyses : results.uxCategoryAnalyses;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-primary hover:bg-primary/10 bg-white border border-primary/20 px-4 py-2 rounded-lg font-semibold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
      </div>

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
                {isUiReview ? (
                   <ScoreCard score={results.uiScore} label="Overall UI Score" summary="Average of all UI categories." />
                ) : (
                   <ScoreCard score={results.uxScore} label="Overall UX Score" summary="Average of all UX categories." />
                )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{analysisTitle} Breakdown</h2>

            {categoryAnalyses && categoryAnalyses.length > 0 ? (
                categoryAnalyses.map((category, index) => (
                    <CategoryAnalysisCard key={index} category={category} />
                ))
            ) : (
                <p className="text-center py-8 text-text-secondary">No analysis data available for this category.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;