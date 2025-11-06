
export enum ReviewType {
  UI = 'UI Review',
  UX = 'UX Review',
}

export interface AnalysisIssue {
  issueTitle: string;
  issueDescription: string;
  recommendation: string;
  relevantLaw?: string;
  severity: 'Critical' | 'Major' | 'Minor';
}

export interface AnalysisResult {
  uiScore: number;
  uxScore: number;
  uiAnalysis: AnalysisIssue[];
  uxAnalysis: AnalysisIssue[];
  overallSummary: string;
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
}
