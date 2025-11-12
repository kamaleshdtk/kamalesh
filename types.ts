


export enum ReviewType {
  UI = 'UI Review',
  UX = 'UX Review',
}

export type GuidelinePreset = 'General' | 'Material Design' | 'Apple HIG' | 'Fluent Design';

export interface AnalysisIssue {
  issueTitle: string;
  issueDescription: string;
  recommendation: string;
  relevantLaw?: string;
  severity: 'Critical' | 'Major' | 'Minor';
}

export interface CategoryAnalysis {
  categoryName: string;
  categoryScore: number;
  issues: AnalysisIssue[];
}

export interface AnalysisResult {
  isCaptcha: boolean;
  isAccessDenied: boolean;
  isErrorPage: boolean;
  isNotUiScreenshot: boolean;
  isFullPage: boolean;
  uiScore: number; // Overall average score
  uxScore: number; // Overall average score
  overallSummary: string;
  uiCategoryAnalyses: CategoryAnalysis[];
  uxCategoryAnalyses: CategoryAnalysis[];
}

export interface AnalysisReport {
  id: string;
  user_id: string;
  input_type: 'URL' | 'Image';
  input_value: string;
  ui_score: number;
  ux_score: number;
  result_json: AnalysisResult;
  created_at: string;
  screenshot_url: string; // base64 data URL
  review_type: ReviewType;
  guideline_preset?: GuidelinePreset;
}