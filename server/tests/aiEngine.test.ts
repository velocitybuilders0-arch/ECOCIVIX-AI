import { describe, it, expect } from "vitest";
import {
  IssueInput,
  RawAIAnalysisSchema,
  IssueCategoryEnum,
  IssuePriorityEnum,
  DepartmentEnum,
} from "../src/ai/types.js";
import { classifyWithRules } from "../src/ai/fallbackClassifier.js";
import { validateAIResponse, buildFinalAnalysisResult } from "../src/ai/validationEngine.js";
import { analyzeIssue } from "../src/ai/aiEngine.js";

describe("ECOCIVIX ML Foundation — Schema & Enum Tests", () => {
  it("should validate allowed issue categories", () => {
    expect(IssueCategoryEnum.safeParse("ROADS_INFRASTRUCTURE").success).toBe(true);
    expect(IssueCategoryEnum.safeParse("STREETLIGHTS_ELECTRICITY").success).toBe(true);
    expect(IssueCategoryEnum.safeParse("INVALID_CATEGORY").success).toBe(false);
  });

  it("should validate allowed priorities", () => {
    expect(IssuePriorityEnum.safeParse("CRITICAL").success).toBe(true);
    expect(IssuePriorityEnum.safeParse("HIGH").success).toBe(true);
    expect(IssuePriorityEnum.safeParse("URGENT").success).toBe(false);
  });

  it("should validate raw AI analysis object structure", () => {
    const validData = {
      category: "WATER_SANITATION",
      priority: "HIGH",
      summary: "Major water pipeline leak flooding main street.",
      department: "WATER_SANITATION",
      environmentalImpact: "HIGH",
      environmentalReason: "Severe water wastage and soil erosion.",
      safetyRisk: "HIGH",
      safetyReason: "Flooded street reduces braking efficiency and poses slip hazards.",
      suggestedAction: "Dispatch emergency repair team to turn off main valve and repair pipe.",
      confidenceScore: 0.95,
    };

    const parsed = RawAIAnalysisSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid enum values in raw AI output", () => {
    const invalidData = {
      category: "WATER_SANITATION",
      priority: "SUPER_HIGH", // Invalid priority
      summary: "Short summary",
      department: "WATER_SANITATION",
      environmentalImpact: "HIGH",
      environmentalReason: "Reason",
      safetyRisk: "HIGH",
      safetyReason: "Reason",
      suggestedAction: "Action",
    };

    const parsed = RawAIAnalysisSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});

describe("ECOCIVIX ML Foundation — Deterministic Fallback Classifier", () => {
  it("should correctly classify electrical/streetlight reports", () => {
    const input: IssueInput = {
      title: "Broken streetlight and exposed sparking wires",
      description: "Streetlight outside Sector 4 park is completely dark and there are sparks flying from open wire.",
    };

    const result = classifyWithRules(input);
    expect(result.category).toBe("STREETLIGHTS_ELECTRICITY");
    expect(result.department).toBe("ELECTRICAL_ENERGY");
    expect(result.priority).toBe("CRITICAL");
    expect(result.safetyRisk).toBe("CRITICAL");
  });

  it("should correctly classify sewage and water leakage reports", () => {
    const input: IssueInput = {
      title: "Sewer overflow near residential area",
      description: "Dirty foul-smelling sewage water leaking from manhole on Main Road.",
    };

    const result = classifyWithRules(input);
    expect(result.category).toBe("WATER_SANITATION");
    expect(result.department).toBe("WATER_SANITATION");
    expect(result.priority).toBe("HIGH");
    expect(result.environmentalImpact).toBe("HIGH");
  });

  it("should correctly classify waste management reports", () => {
    const input: IssueInput = {
      title: "Overflowing plastic waste and garbage dump",
      description: "Large heap of uncollected trash blocking the alleyway.",
    };

    const result = classifyWithRules(input);
    expect(result.category).toBe("WASTE_MANAGEMENT");
    expect(result.department).toBe("ENVIRONMENTAL_HEALTH");
  });
});

describe("ECOCIVIX ML Foundation — Response Validation & Fallback Safety Net", () => {
  it("should successfully parse JSON embedded in markdown code blocks", () => {
    const rawMarkdown = `\`\`\`json
{
  "category": "ROADS_INFRASTRUCTURE",
  "priority": "HIGH",
  "summary": "Dangerous deep pothole on expressway.",
  "department": "PUBLIC_WORKS",
  "environmentalImpact": "LOW",
  "environmentalReason": "Minor asphalt degradation.",
  "safetyRisk": "HIGH",
  "safetyReason": "Can cause sudden vehicle tire blowout.",
  "suggestedAction": "Fill pothole with hot mix asphalt."
}
\`\`\``;

    const validation = validateAIResponse(rawMarkdown);
    expect(validation.success).toBe(true);
    expect(validation.data.category).toBe("ROADS_INFRASTRUCTURE");
  });

  it("should activate fallback on invalid JSON text", () => {
    const invalidText = "Sorry, as an AI model I cannot answer this request.";
    const validation = validateAIResponse(invalidText);
    expect(validation.success).toBe(false);

    const input: IssueInput = {
      title: "Deep pothole on road",
      description: "Pothole causing vehicle damage.",
    };

    const finalResult = buildFinalAnalysisResult(input, validation);
    expect(finalResult.isFallback).toBe(true);
    expect(finalResult.provider).toBe("rule-based-fallback");
    expect(finalResult.category).toBe("ROADS_INFRASTRUCTURE");
  });
});

describe("ECOCIVIX ML Foundation — End-to-End AI Engine Pipeline", () => {
  it("should complete analysis pipeline cleanly and return valid result structure", async () => {
    const input: IssueInput = {
      title: "Chemical stench and toxic smoke from local factory",
      description: "Pungent chemical fumes spreading over residential neighborhood causing eye irritation.",
      locationContext: "Zone B Industrial Park",
    };

    const result = await analyzeIssue(input);

    expect(result.category).toBeDefined();
    expect(result.priority).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.department).toBeDefined();
    expect(result.environmentalImpact).toBeDefined();
    expect(result.safetyRisk).toBeDefined();
    expect(result.suggestedAction).toBeDefined();
    expect(result.analyzedAt).toBeDefined();
    expect(typeof result.isFallback).toBe("boolean");
  });
});
