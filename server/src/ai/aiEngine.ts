import {
  IssueInput,
  IssueInputSchema,
  AIAnalysisResult,
} from "./types.js";
import { callGeminiAPI } from "./geminiClient.js";
import {
  validateAIResponse,
  buildFinalAnalysisResult,
} from "./validationEngine.js";

/**
 * Main ML Foundation Entry Point for ECOCIVIX AI.
 * Analyzes citizen issue input and produces validated, structured AI insights with fallback handling.
 */
export async function analyzeIssue(input: IssueInput): Promise<AIAnalysisResult> {
  // Step 1: Normalize & validate input
  const normalizedInput = IssueInputSchema.parse(input);

  // Step 2: Attempt Gemini API inference
  try {
    const rawText = await callGeminiAPI(normalizedInput);
    const validationResult = validateAIResponse(rawText);

    // Step 3: Build final result (uses fallback if validation failed)
    return buildFinalAnalysisResult(normalizedInput, validationResult);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[ECOCIVIX AI Engine] Gemini API call failed or unavailable (${errMessage}). Triggering fallback classifier.`);

    // Step 4: Graceful fallback trigger
    return buildFinalAnalysisResult(normalizedInput, {
      success: false,
      data: null as any,
      error: errMessage,
    });
  }
}
