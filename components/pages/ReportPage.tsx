import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisReport, AnalysisIssue, ReviewType, CategoryAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { getDisplayName } from '../../utils';
import CategoryIcon from '../shared/CategoryIcon';

const ProgressRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 110;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };
  
  const getScoreDescription = (s: number) => {
      if (s >= 85) return 'Excellent';
      if (s >= 60) return 'Good';
      return 'Needs Improvement';
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90"
      >
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={`${getScoreColor(score)} transition-all duration-1000 ease-in-out`}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute text-center">
        <span className={`text-7xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
        <p className="text-gray-400 dark:text-gray-500 font-semibold text-lg">/ 100</p>
      </div>
       <p className={`absolute bottom-[-45px] text-2xl font-bold ${getScoreColor(score)}`}>
        {getScoreDescription(score)}
      </p>
    </div>
  );
};


const IssueCard: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => {
    const getSeverityStyles = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return { pill: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', border: 'bg-red-500' };
            case 'major': return { pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', border: 'bg-orange-500' };
            case 'minor': return { pill: 'bg-accent-teal/10 text-accent-teal dark:bg-accent-teal/20 dark:text-accent-teal', border: 'bg-accent-teal' };
            default: return { pill: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', border: 'bg-gray-400' };
        }
    }
    const severityStyles = getSeverityStyles(issue.severity);

    return (
        <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${severityStyles.border}`}></div>
            <div className="pl-4">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h4 className="font-bold text-md text-text-primary dark:text-white flex-1">{issue.issueTitle}</h4>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${severityStyles.pill}`}>{issue.severity}</span>
                </div>
                {issue.relevantLaw && <p className="text-sm font-medium text-primary mb-2">{issue.relevantLaw}</p>}
                <p className="text-text-secondary dark:text-gray-400 text-sm mb-3">{issue.issueDescription}</p>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Recommendation:</p>
                    <p className="text-sm text-text-secondary dark:text-gray-300 mt-1">{issue.recommendation}</p>
                </div>
            </div>
        </div>
    );
};


const AccordionItem: React.FC<{ category: CategoryAnalysis, isOpen: boolean, onToggle: () => void }> = ({ category, isOpen, onToggle }) => {
  const score = Math.round(category.categoryScore);
  
  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center py-5 text-left gap-4"
            aria-expanded={isOpen}
        >
            <div className="flex items-center gap-4">
                <CategoryIcon categoryName={category.categoryName} className="w-6 h-6" />
                <h3 className="text-lg font-bold text-text-primary dark:text-white">{category.categoryName}</h3>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-lg font-bold w-16 text-right ${getScoreColor(score)}`}>{score}/100</span>
               <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] pb-6' : 'max-h-0'}`}>
             <div className="space-y-4 pl-10">
                  {category.issues && category.issues.length > 0 ? (
                    category.issues.map((issue, index) => <IssueCard key={index} issue={issue} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-200/60 dark:border-green-800/50 shadow-soft">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="mt-4 font-semibold text-green-800 dark:text-green-200">Excellent! No issues found.</p>
                        <p className="text-sm text-green-700 dark:text-green-400">This category meets all best practice guidelines.</p>
                    </div>
                  )}
            </div>
        </div>
    </div>
  );
};


const ReportPage: React.FC<{ report: AnalysisReport; onBack: () => void; }> = ({ report, onBack }) => {
  const { result_json: results, screenshot_url, review_type } = report;
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const isUiReview = review_type === ReviewType.UI;
  const analysisTitle = isUiReview ? 'UI Analysis' : 'UX Analysis';
  const categoryAnalyses = isUiReview ? results.uiCategoryAnalyses : results.uxCategoryAnalyses;
  const overallScore = isUiReview ? results.uiScore : results.uxScore;

  useEffect(() => {
    // Open the first accordion item by default
    if (categoryAnalyses && categoryAnalyses.length > 0) {
      setOpenAccordion(categoryAnalyses[0].categoryName);
    }
  }, [categoryAnalyses]);

  const handleToggleAccordion = (categoryName: string) => {
    setOpenAccordion(openAccordion === categoryName ? null : categoryName);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    addToast('Generating PDF... This may take a moment.', 'success');

    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let yPos = 0;

        const addHeaderAndFooter = () => {
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor('#7E57FF');
                doc.setFont('helvetica', 'bold');
                doc.text('UXRay AI Report', margin, 10);
                doc.setFontSize(9);
                doc.setTextColor('#6B7280');
                doc.setFont('helvetica', 'normal');
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }
        };

        const checkPageBreak = (heightNeeded: number) => {
            if (yPos + heightNeeded > pageHeight - margin - 15) {
                doc.addPage();
                yPos = margin + 5;
            }
        };

        const addWrappedText = (text: string, x: number, y: number, width: number, options = {}) => {
            const lines = doc.splitTextToSize(text, width);
            doc.text(lines, x, y, options);
            const lineHeight = doc.getLineHeight() * 0.352778;
            return y + (lines.length * lineHeight);
        };
        
        yPos = margin + 5;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor('#111111');
        doc.text('Analysis Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor('#6B7280');
        const displayName = getDisplayName(report);
        const reportDate = new Date(report.created_at).toLocaleDateString();
        doc.text(`Analyzed Target: ${displayName}`, margin, yPos);
        doc.text(`Analysis Date: ${reportDate}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
        doc.setDrawColor('#E5E7EB');
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        checkPageBreak(80);
        const previewElement = document.getElementById('design-preview-img') as HTMLImageElement;
        const summaryWidth = contentWidth / 2 - 5;
        const previewWidth = contentWidth / 2 - 5;
        
        if (previewElement) {
            const canvas = await html2canvas(previewElement, { useCORS: true, scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * previewWidth) / canvas.width;
            doc.addImage(imgData, 'PNG', margin, yPos, previewWidth, imgHeight);
        }

        const summaryX = margin + previewWidth + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor('#111111');
        doc.text('Overall Summary', summaryX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        addWrappedText(results.overallSummary, summaryX, yPos + 8, summaryWidth);
        
        const previewHeight = previewElement ? (previewElement.height * previewWidth) / previewElement.width : 0;
        yPos += Math.max(previewHeight, 40) + 10;
        
        checkPageBreak(30);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        const scoreLabel = isUiReview ? 'Overall UI Score' : 'Overall UX Score';
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor('#111111');
        doc.text(scoreLabel, margin, yPos + 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.setTextColor(overallScore >= 85 ? '#16A34A' : overallScore >= 60 ? '#EAB308' : '#EF4444');
        doc.text(`${overallScore} / 100`, pageWidth - margin, yPos + 7, { align: 'right' });
        yPos += 15;
        
        checkPageBreak(15);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor('#111111');
        doc.text(`${analysisTitle} Breakdown`, margin, yPos);
        yPos += 10;
        
        for (const category of categoryAnalyses) {
            checkPageBreak(12);
            doc.setFillColor('#F9FAFB');
            doc.rect(margin, yPos, contentWidth, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor('#111111');
            doc.text(category.categoryName, margin + 2, yPos + 7);
            doc.text(`${Math.round(category.categoryScore)}/100`, pageWidth - margin - 2, yPos + 7, { align: 'right' });
            yPos += 15;

            if (category.issues.length === 0) {
                 checkPageBreak(10);
                 doc.setFont('helvetica', 'italic');
                 doc.setFontSize(10);
                 doc.setTextColor('#6B7280');
                 doc.text('No specific issues found in this category.', margin + 2, yPos);
                 yPos += 10;
            } else {
              for (const issue of category.issues) {
                  const severityColors = { 'Critical': '#EF4444', 'Major': '#F97316', 'Minor': '#3B82F6' };
                  const estimatedHeight = doc.splitTextToSize(issue.issueTitle + issue.issueDescription + issue.recommendation, contentWidth - 8).length * 5 + 15;
                  checkPageBreak(estimatedHeight);
                  
                  doc.setFillColor(severityColors[issue.severity] || '#6B7280');
                  doc.rect(margin, yPos, 3, 8, 'F');

                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(12);
                  doc.setTextColor('#111111');
                  yPos = addWrappedText(issue.issueTitle, margin + 5, yPos + 3, contentWidth - 10) + 2;

                  if (issue.relevantLaw) {
                      doc.setFont('helvetica', 'italic');
                      doc.setFontSize(10);
                      doc.setTextColor('#7E57FF');
                      yPos = addWrappedText(`Relevant Principle: ${issue.relevantLaw}`, margin + 5, yPos, contentWidth - 10) + 3;
                  }

                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(10);
                  doc.setTextColor('#6B7280');
                  yPos = addWrappedText(issue.issueDescription, margin + 5, yPos, contentWidth - 10) + 4;
                  
                  doc.setFillColor('#F3F4F6');
                  doc.rect(margin + 5, yPos, contentWidth-10, 0.5, 'F');
                  yPos += 2;

                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(10);
                  doc.setTextColor('#15803D');
                  yPos = addWrappedText(`Recommendation: ${issue.recommendation}`, margin + 5, yPos, contentWidth - 10) + 10;
              }
            }
            yPos += 5;
        }
        
        addHeaderAndFooter();
        doc.save(`UXRay-Report-${getDisplayName(report)}.pdf`);

    } catch (error) {
        console.error("Error generating native PDF:", error);
        addToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-form-soft p-6 sm:p-8 border border-gray-200/60 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
              <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary-light font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to Home
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 text-sm text-white bg-primary hover:bg-primary-light px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Exporting...
                      </>
                  ) : (
                      <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export Report
                      </>
                  )}
                </button>
              </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Design Preview</h2>
                <img id="design-preview-img" src={screenshot_url} alt="Analyzed Screenshot" className="rounded-xl shadow-soft w-full border border-gray-200/80 dark:border-gray-700" />
                <div className="mt-6 bg-gray-50/80 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-200/60 dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-2 dark:text-white">Overall Summary</h3>
                    <p className="text-text-secondary dark:text-gray-300 text-sm">{results.overallSummary}</p>
                </div>
            </div>
            <div className="lg:col-span-3">
                 <div className="bg-gray-50/80 dark:bg-gray-900/50 rounded-2xl py-12 px-8 flex flex-col items-center justify-center min-h-[400px] border border-gray-200/60 dark:border-gray-700">
                     <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">Overall {isUiReview ? 'UI' : 'UX'} Score</h2>
                     <ProgressRing score={overallScore} />
                     <p className="text-center text-text-secondary dark:text-gray-400 mt-16 max-w-xs">
                         Based on our analysis, your user {isUiReview ? 'interface is' : 'experience is'} performing well.
                     </p>
                 </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{analysisTitle} breakdown</h2>
              {categoryAnalyses && categoryAnalyses.length > 0 ? (
                <div className="grid grid-cols-1">
                  {categoryAnalyses.map((category) => (
                      <AccordionItem 
                        key={category.categoryName} 
                        category={category}
                        isOpen={openAccordion === category.categoryName}
                        onToggle={() => handleToggleAccordion(category.categoryName)}
                      />
                  ))}
                </div>
            ) : (
                <p className="text-center py-8 text-text-secondary dark:text-gray-400">No analysis data available for this category.</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default ReportPage;