import { GoogleGenerativeAI } from "@google/generative-ai";
import { IssueInput } from "./types.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";

/**
 * Call Google Gemini API to analyze citizen issue input.
 * Returns raw text response from Gemini or throws an error.
 */
export async function callGeminiAPI(
  input: IssueInput,
  apiKey?: string,
  modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash"
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === "" || key.includes("your_gemini_api_key")) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const userPrompt = buildUserPrompt(input);

  // 8-second timeout safety net
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Gemini API call timed out after 8 seconds.")), 8000);
  });

  const generatePromise = (async () => {
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    if (!text) {
      throw new Error("Received empty text output from Gemini API.");
    }
    return text;
  })();

  return Promise.race([generatePromise, timeoutPromise]);
}
