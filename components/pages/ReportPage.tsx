
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport, AnalysisIssue, ReviewType, CategoryAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { getDisplayName } from '../../utils';

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
  <div>
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-gray-200">
      <h3 className="text-xl font-bold text-text-primary">{category.categoryName}</h3>
      <span className="text-lg font-semibold text-gray-600">{Math.round(category.categoryScore)}/100</span>
    </div>
    <div className="space-y-5">
      {category.issues && category.issues.length > 0 ? (
        category.issues.map((issue, index) => <IssueCard key={index} issue={issue} />)
      ) : (
        <div className="text-center py-6 bg-white rounded-2xl border border-gray-200/60 shadow-soft">
            <p className="text-text-secondary">No specific issues found in this category.</p>
        </div>
      )}
    </div>
  </div>
);


const ReportPage: React.FC<{ report: AnalysisReport; onBack: () => void }> = ({ report, onBack }) => {
  const { result_json: results, screenshot_url, review_type } = report;
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    addToast('Generating PDF... This may take a moment.', 'success');

    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let yPos = margin;

        const addWrappedText = (text: string, x: number, y: number, width: number, options = {}) => {
            const lines = doc.splitTextToSize(text, width);
            doc.text(lines, x, y, options);
            const lineHeight = doc.getLineHeight() * 0.352778; // Convert to mm
            return y + (lines.length * lineHeight);
        };
        
        // --- 1. Title ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor('#111111');
        doc.text('UXRay AI Analysis Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // --- 2. Report Info ---
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#6B7280');
        const displayName = getDisplayName(report);
        const reportDate = new Date(report.created_at).toLocaleDateString();
        doc.text(`Analyzed: ${displayName}`, margin, yPos);
        doc.text(`Date: ${reportDate}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 10;
        
        // --- 3. Design Preview ---
        const previewElement = document.getElementById('design-preview-img') as HTMLImageElement;
        if (previewElement) {
            const canvas = await html2canvas(previewElement, { useCORS: true, scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * contentWidth) / canvas.width;
            if (yPos + imgHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.addImage(imgData, 'PNG', margin, yPos, contentWidth, imgHeight);
            yPos += imgHeight + 10;
        }

        // --- 4. Overall Summary ---
        if (yPos > pageHeight - margin - 20) { doc.addPage(); yPos = margin; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor('#111111');
        doc.text('Overall Summary', margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        yPos = addWrappedText(results.overallSummary, margin, yPos, contentWidth) + 10;

        // --- 5. Score ---
        if (yPos > pageHeight - margin - 20) { doc.addPage(); yPos = margin; }
        const isUiReview = report.review_type === ReviewType.UI;
        const score = isUiReview ? results.uiScore : results.uxScore;
        const scoreLabel = isUiReview ? 'Overall UI Score' : 'Overall UX Score';
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor('#111111');
        doc.text(scoreLabel, margin, yPos);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(score >= 85 ? '#16A34A' : score >= 60 ? '#F59E0B' : '#DC2626');
        doc.text(`${score}`, pageWidth - margin, yPos + 2, { align: 'right' });
        yPos += 15;

        // --- 6. Analysis Breakdown ---
        const categoryAnalyses = isUiReview ? results.uiCategoryAnalyses : results.uxCategoryAnalyses;
        const analysisTitle = isUiReview ? 'UI Analysis Breakdown' : 'UX Analysis Breakdown';
        
        if (yPos > pageHeight - margin - 20) { doc.addPage(); yPos = margin; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor('#111111');
        doc.text(analysisTitle, margin, yPos);
        yPos += 10;
        
        for (const category of categoryAnalyses) {
            if (yPos > pageHeight - margin - 30) { doc.addPage(); yPos = margin; }
            doc.setDrawColor('#E5E7EB');
            doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor('#111111');
            doc.text(category.categoryName, margin, yPos + 5);
            doc.text(`${Math.round(category.categoryScore)}/100`, pageWidth - margin, yPos + 5, { align: 'right' });
            yPos += 12;

            if (category.issues.length === 0) {
                 if (yPos > pageHeight - margin - 15) { doc.addPage(); yPos = margin; }
                 doc.setFont('helvetica', 'normal');
                 doc.setFontSize(10);
                 doc.setTextColor('#6B7280');
                 doc.text('No specific issues found in this category.', margin, yPos);
                 yPos += 10;
            } else {
              for (const issue of category.issues) {
                  const titleHeight = doc.splitTextToSize(issue.issueTitle, contentWidth).length * 5;
                  const descHeight = doc.splitTextToSize(issue.issueDescription, contentWidth).length * 4;
                  const recHeight = doc.splitTextToSize(issue.recommendation, contentWidth).length * 4;
                  const lawHeight = issue.relevantLaw ? 4 : 0;
                  const estimatedHeight = titleHeight + descHeight + recHeight + lawHeight + 15;

                  if (yPos + estimatedHeight > pageHeight - margin) {
                      doc.addPage();
                      yPos = margin;
                  }

                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(12);
                  doc.setTextColor('#111111');
                  yPos = addWrappedText(issue.issueTitle, margin, yPos, contentWidth) + 1;

                  if (issue.relevantLaw) {
                      doc.setFont('helvetica', 'normal');
                      doc.setFontSize(10);
                      doc.setTextColor('#7E57FF');
                      yPos = addWrappedText(`Relevant Law: ${issue.relevantLaw}`, margin, yPos, contentWidth) + 2;
                  }

                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(10);
                  doc.setTextColor('#6B7280');
                  yPos = addWrappedText(`Description: ${issue.issueDescription}`, margin, yPos, contentWidth) + 2;

                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor('#15803D');
                  yPos = addWrappedText(`Recommendation: ${issue.recommendation}`, margin, yPos, contentWidth) + 8;
              }
            }
        }
        
        doc.save(`UXRay-Report-${getDisplayName(report)}.pdf`);

    } catch (error) {
        console.error("Error generating native PDF:", error);
        addToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
        setIsExporting(false);
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
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 text-sm text-primary hover:bg-primary/10 bg-white border border-primary/20 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export as PDF
                </>
            )}
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1">
            <div className="sticky top-28">
                <h2 className="text-2xl font-bold mb-4">Design Preview</h2>
                <img id="design-preview-img" src={screenshot_url} alt="Analyzed Screenshot" className="rounded-2xl shadow-form-soft w-full border border-gray-200/80" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {categoryAnalyses.map((category, index) => (
                      <CategoryAnalysisCard key={index} category={category} />
                  ))}
                </div>
            ) : (
                <p className="text-center py-8 text-text-secondary">No analysis data available for this category.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
