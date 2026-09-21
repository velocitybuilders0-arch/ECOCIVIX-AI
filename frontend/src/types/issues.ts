export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type IssueCategory =
  | 'ROADS_INFRASTRUCTURE'
  | 'WATER_SANITATION'
  | 'WASTE_MANAGEMENT'
  | 'STREETLIGHTS_ELECTRICITY'
  | 'PUBLIC_SAFETY'
  | 'PARKS_ENVIRONMENT'
  | 'PUBLIC_FACILITIES'
  | 'OTHER_CIVIC';

export type EnvironmentalImpact = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SafetyRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

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
  environmentalImpact?: EnvironmentalImpact;
  environmentalReason?: string;
  safetyRisk?: SafetyRisk;
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

export interface Issue {
  id: string;
  title: string;
  description: string;
  locationContext?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  citizenId?: string;
  citizenName?: string;
  mlPriority: PriorityLevel;
  mlConfidence: number;
  mlModelVersion: string;
  aiAnalysis?: AIAnalysis | null;
  status: IssueStatus;
  adminNote?: string | null;
  assignedDepartment?: string | null;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  locationContext?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  mlPriority: PriorityLevel;
  mlConfidence: number;
  mlModelVersion: string;
  aiAnalysis?: AIAnalysis;
}

export interface UpdateStatusInput {
  status: IssueStatus;
  adminNote?: string;
  assignedDepartment?: string;
  assignedStaffId?: string;
}
