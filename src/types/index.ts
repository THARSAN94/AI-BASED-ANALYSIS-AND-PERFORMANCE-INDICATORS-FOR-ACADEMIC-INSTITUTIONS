export interface User {
  id: string;
  name: string;
  email: string;
  collegeName: string;
  role: 'admin' | 'institution_admin' | 'faculty';
}

export interface CriterionDoc {
  id: string;
  type: 'aicte' | 'ugc';
  code: string;
  category: string;
  title: string;
  description: string;
  benchmarkRule: string;
  thresholdValue?: number | string | boolean;
  unit?: string;
  isMandatory: boolean;
  statutoryReference: string;
  improvementTip: string;
}

export interface CriterionResult {
  code: string;
  category: string;
  title: string;
  submittedValue: any;
  submittedValueFormatted: string;
  requiredCondition: string;
  status: 'Criteria Satisfied' | 'Criteria Not Satisfied';
  identifiedGap?: string;
  recommendation?: string;
  isMandatory: boolean;
}

export interface RecommendationItem {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  actionItems: string[];
  timeline: string;
}

export interface AssessmentResult {
  id?: string;
  userId?: string;
  institutionName: string;
  moduleType: 'aicte' | 'ugc';
  timestamp?: string;
  overallStatus: 'Satisfied' | 'Action Required' | 'Substantial Compliance';
  overallMessage: string;
  complianceScore: number;
  totalCriteria: number;
  satisfiedCount: number;
  gapCount: number;
  criteriaResults: CriterionResult[];
  recommendations: RecommendationItem[];
  aiExecutiveSummary?: string;
  formData: any;
}

export interface DashboardStats {
  totalAssessments: number;
  aicteCount: number;
  ugcCount: number;
  avgComplianceScore: number;
  fullySatisfiedCount: number;
  latestAssessment?: AssessmentResult | null;
}
