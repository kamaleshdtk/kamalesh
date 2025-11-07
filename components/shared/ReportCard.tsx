import React from 'react';
import { AnalysisReport, ReviewType } from '../../types';
import { getDisplayName, formatDate } from '../../utils';

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
          className="group bg-white rounded-2xl shadow-soft hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden text-left w-full"
          onClick={() => onView(report)}
        >
            <div className="h-48 bg-gray-100 overflow-hidden">
                <img src={report.screenshot_url} alt="Screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <p className="font-bold text-gray-800 truncate" title={report.input_value}>
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(report.created_at)}</p>
                    <span className="mt-3 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
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

export default ReportCard;