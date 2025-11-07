
import React, { useState, useMemo } from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { getDisplayName, formatDate } from '../../utils';

interface HistoryPageProps {
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  onBack: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'ui-desc' | 'ui-asc' | 'ux-desc' | 'ux-asc';

const ReportCard: React.FC<{report: AnalysisReport; onView: (report: AnalysisReport) => void}> = ({ report, onView }) => {
    const displayName = getDisplayName(report);
    const score = report.review_type === ReviewType.UI ? report.ui_score : report.ux_score;

    const getScoreColor = (s: number) => {
        if (s >= 85) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <button
          className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden text-left w-full"
          onClick={() => onView(report)}
        >
            <div className="h-48 bg-gray-100">
                <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800 truncate" title={report.input_value}>
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(report.created_at)}</p>
                    <span className="mt-3 inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {report.review_type}
                    </span>
                </div>
                <div className="flex items-baseline pl-4">
                    <span className={`text-5xl font-extrabold ${getScoreColor(score)}`}>
                        {score}
                    </span>
                    <span className="text-xl font-semibold text-gray-400">/100</span>
                </div>
            </div>
        </button>
    );
};

const HistoryEmptyState: React.FC = () => (
  <div className="text-center py-20 px-6 bg-white rounded-2xl shadow-soft border border-gray-200/60">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
      </div>
      <h3 className="mt-5 text-xl font-bold text-text-primary">Your History is Empty</h3>
      <p className="mt-2 text-base text-text-secondary">Start your first analysis to see your reports here.</p>
  </div>
);


const HistoryPage: React.FC<HistoryPageProps> = ({ reports, onViewReport, onBack }) => {
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  
  const sortedReports = useMemo(() => {
    const reportsCopy = [...reports];
    return reportsCopy.sort((a, b) => {
      switch (sortOption) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'ui-desc':
          return b.ui_score - a.ui_score;
        case 'ui-asc':
          return a.ui_score - b.ui_score;
        case 'ux-desc':
          return b.ux_score - a.ux_score;
        case 'ux-asc':
          return a.ux_score - b.ux_score;
        case 'date-desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [reports, sortOption]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
       <div className="mb-8">
           <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </button>
       </div>
       <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-text-primary">Analyze History</h3>
          {reports.length > 0 && (
            <div className="relative">
              <select 
                id="sort-history"
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-3 pr-10 py-2.5 appearance-none"
                aria-label="Sort reports"
              >
                <option value="date-desc">Sort by: Newest First</option>
                <option value="date-asc">Sort by: Oldest First</option>
                <option value="ui-desc">Sort by: UI Score (High-Low)</option>
                <option value="ui-asc">Sort by: UI Score (Low-High)</option>
                <option value="ux-desc">Sort by: UX Score (High-Low)</option>
                <option value="ux-asc">Sort by: UX Score (Low-High)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}
       </div>
       
       {reports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedReports.map(report => (
                  <ReportCard key={report.id} report={report} onView={onViewReport} />
              ))}
          </div>
       ) : (
          <HistoryEmptyState />
       )}
    </div>
  );
};

export default HistoryPage;
