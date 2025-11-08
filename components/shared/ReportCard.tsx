

import React from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { getDisplayName, formatDate } from '../../utils';

const ReportCard: React.FC<{report: AnalysisReport; onView: (report: AnalysisReport) => void; status?: 'Approved' | 'Needs Fix'}> = ({ report, onView, status }) => {
    const displayName = getDisplayName(report);
    const score = report.review_type === ReviewType.UI ? report.ui_score : report.ux_score;

    const getScoreColor = (s: number) => {
        if (s >= 85) return 'text-green-600 dark:text-green-400';
        if (s >= 60) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };
    
    const statusStyles = {
        'Approved': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'Needs Fix': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
    };

    return (
        <button
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-soft hover:shadow-lg dark:border dark:border-gray-700 dark:hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden text-left w-full flex flex-col"
          onClick={() => onView(report)}
        >
            <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="font-bold text-gray-800 dark:text-white truncate" title={report.input_value}>
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(report.created_at)}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                          {report.review_type}
                        </span>
                        {status && (
                             <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
                                {status}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex justify-end items-baseline pt-4">
                    <span className={`text-5xl font-extrabold ${getScoreColor(score)}`}>
                        {score}
                    </span>
                    <span className="text-xl font-semibold text-gray-400 dark:text-gray-500">/100</span>
                </div>
            </div>
        </button>
    );
};

export default ReportCard;