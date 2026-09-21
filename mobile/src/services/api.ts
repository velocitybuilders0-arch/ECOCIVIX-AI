import { CivicIssue, DualAIAnalysisResult, IssueStatus } from "../types";
import { getSession } from "./auth";

const API_BASE_URL = `${(process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "")}/api/issues`;

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const session = await getSession();
  if (!session?.access_token) {
    throw new Error("Please sign in before using the civic portal.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
};

/**
 * Run ML Priority + LLM Dual Analysis
 */
export async function analyzeIssueApi(
  title: string,
  description: string,
  locationContext?: string,
  imageUrl?: string
): Promise<DualAIAnalysisResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ title, description, locationContext, imageUrl }),
    });

    if (res.ok) {
      return (await res.json()) as DualAIAnalysisResult;
    }
  } catch (err) {
    console.log("[API] Analysis request failed:", err);
  }

  console.warn('[api] backend unreachable — using offline fallback');
  return {
    priority: "MEDIUM",
    confidence: 0.5,
    modelVersion: "offline-fallback",
    labelScores: { LOW: 0.25, MEDIUM: 0.5, HIGH: 0.15, CRITICAL: 0.1 },
    aiAnalysis: null,
    llmAvailable: false,
    analyzedAt: new Date().toISOString(),
    isFallback: true,
    provider: "client-side-rule-fallback",
  };
}

/**
 * Submit Issue to Persistence Layer
 */
export async function submitIssueApi(issueData: {
  title: string;
  description: string;
  locationContext?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  citizenId?: string;
  mlPriority: DualAIAnalysisResult["priority"];
  mlConfidence: number;
  mlModelVersion: string;
  aiAnalysis?: any;
}): Promise<CivicIssue> {
  try {
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify(issueData),
    });

    if (res.ok) {
      const json = await res.json();
      return json.issue;
    }
  } catch (err) {
    console.log("[API] Issue submission failed:", err);
  }

  throw new Error("The server is unavailable. Your issue was not submitted.");
}

/**
 * Fetch All Issues (with optional citizen filter)
 */
export async function fetchIssuesApi(citizenId?: string): Promise<CivicIssue[]> {
  try {
    const url = citizenId ? `${API_BASE_URL}?citizenId=${citizenId}` : API_BASE_URL;
    const res = await fetch(url, { headers: await getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      return json.issues;
    }
  } catch (err) {
    console.log("[API] Issue list request failed:", err);
  }

  throw new Error("The server is unavailable. Issues could not be loaded.");
}

/**
 * Update Issue Status (Admin Command Center)
 */
export async function updateIssueStatusApi(
  issueId: string,
  status: IssueStatus,
  adminNote?: string,
  assignedDepartment?: string
): Promise<CivicIssue> {
  try {
    const res = await fetch(`${API_BASE_URL}/${issueId}/status`, {
      method: "PATCH",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status, adminNote, assignedDepartment }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.issue;
    }
  } catch (err) {
    console.log("[API] Issue update failed:", err);
  }

  throw new Error("The server is unavailable. The issue was not updated.");
}
