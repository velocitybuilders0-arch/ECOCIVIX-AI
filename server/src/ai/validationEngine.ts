import {
  IssueInput,
  RawAIAnalysisSchema,
  AIAnalysisResult,
  RawAIAnalysis,
} from "./types.js";
import { classifyWithRules } from "./fallbackClassifier.js";

export interface ValidationOutput {
  success: boolean;
  data: RawAIAnalysis;
  error?: string;
}

/**
 * Parses and validates raw LLM responses against Zod schema and allowed enum constraints.
 */
export function validateAIResponse(rawOutput: unknown): ValidationOutput {
  try {
    let parsed: unknown = rawOutput;

    // If input is string, strip markdown fences if present and parse JSON
    if (typeof rawOutput === "string") {
      let cleaned = rawOutput.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(cleaned);
    }

    const validated = RawAIAnalysisSchema.parse(parsed);

    return {
      success: true,
      data: validated,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      data: null as unknown as RawAIAnalysis,
      error: `Validation error: ${errorMessage}`,
    };
  }
}

/**
 * Builds standard AIAnalysisResult object with fallback safety net.
 */
export function buildFinalAnalysisResult(
  input: IssueInput,
  validationResult: ValidationOutput,
  providerName = "gemini-2.5-flash"
): AIAnalysisResult {
  const now = new Date().toISOString();

  if (validationResult.success && validationResult.data) {
    return {
      ...validationResult.data,
      isFallback: false,
      provider: providerName,
      analyzedAt: now,
    };
  }

  // If AI call or validation failed, trigger deterministic fallback classifier
  const fallbackData = classifyWithRules(input);
  return {
    ...fallbackData,
    isFallback: true,
    provider: "rule-based-fallback",
    analyzedAt: now,
  };
}
