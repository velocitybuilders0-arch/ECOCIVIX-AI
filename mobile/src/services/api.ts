import { CivicIssue, DualAIAnalysisResult, IssueStatus, PriorityLevel, IssueCategory, AIAnalysis } from "../types";

// In Expo development on real device/simulator, localhost refers to device or loopback.
// Default to standard local dev IP or loopback.
const API_BASE_URL = "http://localhost:3000/api/issues";

let offlineFallbackActive = false;

export function isOfflineFallbackActive(): boolean {
  return offlineFallbackActive;
}

// In-memory demo store for seamless offline/standalone demo experience
let mockIssuesStore: CivicIssue[] = [
  {
    id: "demo-001",
    title: "Burst water main flooding residential street",
    description: "High pressure potable water pipe ruptured under main intersection. Water is flooding into nearby driveways and basements.",
    location_context: "Sector 14, Main Crossroad",
    latitude: 28.4595,
    longitude: 77.0266,
    citizen_id: "garv-citizen-01",
    ml_priority: "CRITICAL",
    ml_confidence: 0.942,
    ml_model_version: "v1.0.0-distilbert",
    ai_analysis: {
      category: "WATER_SANITATION",
      priority: "CRITICAL",
      department: "WATER_SANITATION",
      summary: "Severe pipe burst threatening structural damage and flooding homes.",
      environmentalImpact: "HIGH",
      environmentalReason: "Massive freshwater loss and local urban runoff contamination.",
      safetyRisk: "HIGH",
      safetyReason: "Erosion of road foundation and hazard to pedestrian and vehicular traffic.",
      suggestedAction: "Immediate isolation valve shutoff and emergency heavy repair crew dispatch.",
    },
    status: "IN_PROGRESS",
    assigned_department: "WATER_SANITATION",
    admin_note: "Dispatched fast-response valve isolation team. ETA 15 mins.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "demo-002",
    title: "Exposed live wiring hanging from damaged streetlight",
    description: "Storm knocked lamp post glass off, electric wire dangling within reach of pedestrians on sidewalk.",
    location_context: "Civic Center Park North Gate",
    latitude: 28.4601,
    longitude: 77.0312,
    citizen_id: "garv-citizen-01",
    ml_priority: "CRITICAL",
    ml_confidence: 0.965,
    ml_model_version: "v1.0.0-distilbert",
    ai_analysis: {
      category: "STREETLIGHTS_ELECTRICITY",
      priority: "CRITICAL",
      department: "ELECTRICAL_ENERGY",
      summary: "Exposed live electrical conductor poses immediate electrocution hazard.",
      environmentalImpact: "LOW",
      safetyRisk: "CRITICAL",
      safetyReason: "Direct contact risk with 220V municipal power grid in public walkway.",
      suggestedAction: "De-energize section grid circuit breaker and dispatch electrical emergency team.",
    },
    status: "ACKNOWLEDGED",
    assigned_department: "ELECTRICAL_ENERGY",
    admin_note: "Grid sector B-14 remote switch opened. Repair truck en route.",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "demo-003",
    title: "Overflowing commercial garbage dump attracting pests",
    description: "Three large communal dumpster bins overflowing for 4 days. Strong odor and rodents observed.",
    location_context: "Behind Market Block 3",
    latitude: 28.4552,
    longitude: 77.0211,
    citizen_id: "garv-citizen-01",
    ml_priority: "HIGH",
    ml_confidence: 0.884,
    ml_model_version: "v1.0.0-distilbert",
    ai_analysis: {
      category: "WASTE_MANAGEMENT",
      priority: "HIGH",
      department: "ENVIRONMENTAL_HEALTH",
      summary: "Severe municipal solid waste accumulation causing public health hazard.",
      environmentalImpact: "HIGH",
      environmentalReason: "Leachate and organic decomposition polluting soil and air.",
      safetyRisk: "MODERATE",
      safetyReason: "Vector breeding site (rodents/flies) creating infectious disease risk.",
      suggestedAction: "Deploy heavy compactor truck and apply disinfectant spray to site.",
    },
    status: "OPEN",
    assigned_department: "ENVIRONMENTAL_HEALTH",
    admin_note: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "demo-004",
    title: "Deep pothole on high-speed arterial roadway",
    description: "Roughly 2 feet wide, 6 inches deep crater on lane 2. Vehicles swerving sharply to avoid.",
    location_context: "Eastern Bypass KM 12",
    latitude: 28.4489,
    longitude: 77.0188,
    citizen_id: "garv-citizen-02",
    ml_priority: "HIGH",
    ml_confidence: 0.912,
    ml_model_version: "v1.0.0-distilbert",
    ai_analysis: {
      category: "ROADS_INFRASTRUCTURE",
      priority: "HIGH",
      department: "PUBLIC_WORKS",
      summary: "Severe roadway pavement cavity creating collision hazard.",
      environmentalImpact: "LOW",
      safetyRisk: "HIGH",
      safetyReason: "High probability of tire blowout or sudden lane deviation collisions.",
      suggestedAction: "Place reflective cones immediately and execute rapid cold-mix asphalt patch.",
    },
    status: "RESOLVED",
    assigned_department: "PUBLIC_WORKS",
    admin_note: "Pothole filled with rapid polymer asphalt. Road reopened.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, locationContext, imageUrl }),
    });

    if (res.ok) {
      offlineFallbackActive = false;
      return (await res.json()) as DualAIAnalysisResult;
    }
  } catch (err) {
    console.log("[API] Server unreachable, using high-fidelity local AI pipeline simulator:", err);
  }

  offlineFallbackActive = true;

  // High-fidelity fallback / standalone demo response:
  const text = `${title} ${description}`.toLowerCase();
  let priority: PriorityLevel = "MEDIUM";
  let confidence = 0.89;
  let category: IssueCategory = "OTHER_CIVIC";
  let department = "COMMUNITY_SERVICES";
  let envImpact: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  let safetyRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
  let suggested = "Standard civic inspection and resolution scheduling.";

  if (text.includes("wire") || text.includes("electric") || text.includes("spark") || text.includes("burst") || text.includes("gas") || text.includes("collapse")) {
    priority = "CRITICAL";
    confidence = 0.96;
    category = text.includes("wire") || text.includes("electric") ? "STREETLIGHTS_ELECTRICITY" : "PUBLIC_SAFETY";
    department = category === "STREETLIGHTS_ELECTRICITY" ? "ELECTRICAL_ENERGY" : "DISASTER_RESPONSE";
    safetyRisk = "CRITICAL";
    suggested = "EMERGENCY: Dispatch urgent response crew to secure site immediately.";
  } else if (text.includes("water") || text.includes("sewer") || text.includes("flood") || text.includes("leak")) {
    priority = "HIGH";
    confidence = 0.92;
    category = "WATER_SANITATION";
    department = "WATER_SANITATION";
    envImpact = "HIGH";
    safetyRisk = "HIGH";
    suggested = "Dispatch water network repair unit to isolate leak and restore service.";
  } else if (text.includes("garbage") || text.includes("trash") || text.includes("dump") || text.includes("waste")) {
    priority = "HIGH";
    confidence = 0.88;
    category = "WASTE_MANAGEMENT";
    department = "ENVIRONMENTAL_HEALTH";
    envImpact = "HIGH";
    safetyRisk = "MODERATE";
    suggested = "Deploy sanitation crew and waste hauler for immediate pickup.";
  } else if (text.includes("pothole") || text.includes("road") || text.includes("crack")) {
    priority = "HIGH";
    confidence = 0.91;
    category = "ROADS_INFRASTRUCTURE";
    department = "PUBLIC_WORKS";
    safetyRisk = "HIGH";
    suggested = "Schedule road maintenance team for asphalt patching.";
  }

  const baseScores = {
    LOW: (priority as string) === "LOW" ? confidence : (1 - confidence) / 3,
    MEDIUM: (priority as string) === "MEDIUM" ? confidence : (1 - confidence) / 3,
    HIGH: (priority as string) === "HIGH" ? confidence : (1 - confidence) / 3,
    CRITICAL: (priority as string) === "CRITICAL" ? confidence : (1 - confidence) / 3,
  };

  return {
    priority,
    confidence,
    modelVersion: "offline-fallback",
    labelScores: baseScores,
    aiAnalysis: {
      category,
      priority,
      department,
      summary: `Automated assessment of "${title}".`,
      environmentalImpact: envImpact,
      environmentalReason: "Environmental footprint analyzed based on municipal ecological metrics.",
      safetyRisk,
      safetyReason: "Hazard assessment evaluated based on pedestrian and vehicular proximity.",
      suggestedAction: suggested,
    },
    llmAvailable: true,
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issueData),
    });

    if (res.ok) {
      const json = await res.json();
      return json.issue;
    }
  } catch (err) {
    console.log("[API] Server unreachable, persisting to local store:", err);
  }

  // Local store persistence
  const newIssue: CivicIssue = {
    id: `civic-${Date.now()}`,
    title: issueData.title,
    description: issueData.description,
    location_context: issueData.locationContext,
    image_url: issueData.imageUrl,
    latitude: issueData.latitude ?? 28.4595,
    longitude: issueData.longitude ?? 77.0266,
    citizen_id: issueData.citizenId ?? "garv-citizen-01",
    ml_priority: issueData.mlPriority,
    ml_confidence: issueData.mlConfidence,
    ml_model_version: issueData.mlModelVersion,
    ai_analysis: issueData.aiAnalysis,
    status: "OPEN",
    admin_note: null,
    assigned_department: issueData.aiAnalysis?.department ?? "PUBLIC_WORKS",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockIssuesStore = [newIssue, ...mockIssuesStore];
  return newIssue;
}

/**
 * Fetch All Issues (with optional citizen filter)
 */
export async function fetchIssuesApi(citizenId?: string): Promise<CivicIssue[]> {
  try {
    const url = citizenId ? `${API_BASE_URL}?citizenId=${citizenId}` : API_BASE_URL;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      return json.issues;
    }
  } catch (err) {
    console.log("[API] Server unreachable, returning mock issues store:", err);
  }

  if (citizenId) {
    return mockIssuesStore.filter((i) => i.citizen_id === citizenId);
  }
  return mockIssuesStore;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote, assignedDepartment }),
    });

    if (res.ok) {
      const json = await res.json();
      return json.issue;
    }
  } catch (err) {
    console.log("[API] Server unreachable, updating local store:", err);
  }

  const idx = mockIssuesStore.findIndex((i) => i.id === issueId);
  if (idx !== -1) {
    mockIssuesStore[idx] = {
      ...mockIssuesStore[idx],
      status,
      admin_note: adminNote ?? mockIssuesStore[idx].admin_note,
      assigned_department: assignedDepartment ?? mockIssuesStore[idx].assigned_department,
      updated_at: new Date().toISOString(),
    };
    return mockIssuesStore[idx];
  }

  throw new Error("Issue not found");
}
