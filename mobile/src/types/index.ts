export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IssueStatus = "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type IssueCategory =
  | "ROADS_INFRASTRUCTURE"
  | "WATER_SANITATION"
  | "WASTE_MANAGEMENT"
  | "STREETLIGHTS_ELECTRICITY"
  | "PUBLIC_SAFETY"
  | "PARKS_ENVIRONMENT"
  | "OTHER_CIVIC";

export interface MLPrediction {
  priority: PriorityLevel;
  confidence: number;
  modelVersion: string;
  labelScores: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export interface AIAnalysis {
  category?: IssueCategory;
  priority?: PriorityLevel;
  summary?: string;
  department?: string;
  environmentalImpact?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  environmentalReason?: string;
  safetyRisk?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  safetyReason?: string;
  suggestedAction?: string;
  isFallback?: boolean;
  provider?: string;
}

export interface DualAIAnalysisResult {
  priority: PriorityLevel;
  confidence: number;
  modelVersion: string;
  labelScores: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  aiAnalysis?: AIAnalysis | null;
  llmAvailable: boolean;
  analyzedAt: string;
  isFallback?: boolean;
  provider?: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  location_context?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  citizen_id?: string;
  ml_priority: PriorityLevel;
  ml_confidence: number;
  ml_model_version: string;
  ai_analysis?: AIAnalysis | null;
  status: IssueStatus;
  admin_note?: string | null;
  assigned_department?: string | null;
  created_at: string;
  updated_at: string;
}

export type ScreenType =
  | "LOGIN"
  | "ONBOARDING"
  | "DASHBOARD"
  | "STAFF"
  | "REPORT"
  | "ANALYZE"
  | "MY_ISSUES"
  | "DETAIL"
  | "ADMIN";
