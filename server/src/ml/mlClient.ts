/**
 * ECOCIVIX AI — ML Inference Client
 * Calls the Python FastAPI priority classifier service.
 * Contract: POST /predict → { priority, confidence, modelVersion, labelScores }
 */
import dotenv from "dotenv";
dotenv.config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "http://localhost:8001";
const ML_TIMEOUT_MS = 10_000;

export interface MLPrediction {
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  modelVersion: string;
  labelScores: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export async function callMLService(
  title: string,
  description: string
): Promise<MLPrediction> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ML service returned ${response.status}: ${text}`);
    }

    return (await response.json()) as MLPrediction;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`ML service timed out after ${ML_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkMLHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
