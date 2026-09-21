import { GoogleGenAI } from "@google/genai";
import { IssueInput } from "./types.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";

/**
 * Call Google Gemini API to analyze citizen issue input.
 * Returns raw text response from Gemini or throws an error.
 */
export async function callGeminiAPI(
  input: IssueInput,
  apiKey?: string,
  modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === "" || key.includes("your_gemini_api_key")) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const userPrompt = buildUserPrompt(input);

  // Set timeout safety net of 8000ms
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Gemini API call timed out after 8 seconds.")), 8000);
  });

  const generatePromise = (async () => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received empty text output from Gemini API.");
    }

    return text;
  })();

  return Promise.race([generatePromise, timeoutPromise]);
}
