import { z } from "zod";

// Allowed Categories enum
export const IssueCategoryEnum = z.enum([
  "ROADS_INFRASTRUCTURE",
  "STREETLIGHTS_ELECTRICITY",
  "WATER_SANITATION",
  "WASTE_MANAGEMENT",
  "PUBLIC_SAFETY_HAZARDS",
  "ENVIRONMENTAL_POLLUTION",
  "OTHER_CIVIC",
]);
export type IssueCategory = z.infer<typeof IssueCategoryEnum>;

// Allowed Priority levels enum
export const IssuePriorityEnum = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type IssuePriority = z.infer<typeof IssuePriorityEnum>;

// Allowed Environmental Impact levels enum
export const EnvironmentalImpactEnum = z.enum([
  "CRITICAL",
  "HIGH",
  "MODERATE",
  "LOW",
  "NONE",
]);
export type EnvironmentalImpact = z.infer<typeof EnvironmentalImpactEnum>;

// Allowed Safety Risk levels enum
export const SafetyRiskEnum = z.enum([
  "CRITICAL",
  "HIGH",
  "MODERATE",
  "LOW",
  "NONE",
]);
export type SafetyRisk = z.infer<typeof SafetyRiskEnum>;

// Allowed Departments enum
export const DepartmentEnum = z.enum([
  "PUBLIC_WORKS",
  "ELECTRICAL_ENERGY",
  "WATER_SANITATION",
  "ENVIRONMENTAL_HEALTH",
  "PUBLIC_SAFETY",
  "COMMUNITY_SERVICES",
]);
export type Department = z.infer<typeof DepartmentEnum>;

// Input Schema for raw issue reporting
export const IssueInputSchema = z.object({
  title: z.string().min(1, "Issue title is required").max(200),
  description: z.string().min(1, "Issue description is required").max(2000),
  locationContext: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});
export type IssueInput = z.infer<typeof IssueInputSchema>;

// Raw AI Output Zod Schema (matching structured output requested from Gemini)
export const RawAIAnalysisSchema = z.object({
  category: IssueCategoryEnum,
  priority: IssuePriorityEnum,
  summary: z.string().min(5, "Summary must be at least 5 characters long"),
  department: DepartmentEnum,
  environmentalImpact: EnvironmentalImpactEnum,
  environmentalReason: z.string().min(3, "Environmental reason required"),
  safetyRisk: SafetyRiskEnum,
  safetyReason: z.string().min(3, "Safety reason required"),
  suggestedAction: z.string().min(5, "Suggested action required"),
  confidenceScore: z.number().min(0).max(1).optional().default(0.9),
});
export type RawAIAnalysis = z.infer<typeof RawAIAnalysisSchema>;

// Final AI Analysis Result Schema (includes pipeline metadata & fallback flag)
export const AIAnalysisResultSchema = RawAIAnalysisSchema.extend({
  isFallback: z.boolean(),
  provider: z.string(),
  analyzedAt: z.string(),
});
export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;
