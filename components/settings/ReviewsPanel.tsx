import React, { useState } from 'react';
import { AnalysisReport } from '../../types';
import ReportCard from '../shared/ReportCard';
import HistoryEmptyState from '../shared/HistoryEmptyState';

interface ReviewsPanelProps {
    reports: AnalysisReport[];
    onViewReport: (report: AnalysisReport) => void;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({ reports, onViewReport }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(reports.length / itemsPerPage);
    
    if (reports.length === 0) {
        return <HistoryEmptyState />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedReports.map(report => (
                    <ReportCard key={report.id} report={report} onView={onViewReport} status={report.ui_score > 70 ? 'Approved' : 'Needs Fix'} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                currentPage === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&gt;</button>
                </div>
            )}
        </div>
    );
};

export default ReviewsPanel;
