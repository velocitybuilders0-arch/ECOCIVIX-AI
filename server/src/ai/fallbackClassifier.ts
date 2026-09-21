import {
  IssueInput,
  RawAIAnalysis,
  IssueCategory,
  IssuePriority,
  Department,
  EnvironmentalImpact,
  SafetyRisk,
} from "./types.js";

/**
 * Deterministic Rule-based Fallback Classifier for ECOCIVIX AI.
 * Activated when Gemini AI provider is unavailable, times out, or fails schema validation.
 */
export function classifyWithRules(input: IssueInput): RawAIAnalysis {
  const text = `${input.title} ${input.description}`.toLowerCase();

  let category: IssueCategory = "OTHER_CIVIC";
  let priority: IssuePriority = "MEDIUM";
  let department: Department = "COMMUNITY_SERVICES";
  let environmentalImpact: EnvironmentalImpact = "LOW";
  let environmentalReason = "Minor civic concern with negligible environmental disruption.";
  let safetyRisk: SafetyRisk = "LOW";
  let safetyReason = "Standard civic notice with minimal immediate safety hazard.";
  let suggestedAction = "Log report and assign to local community support team for standard dispatch.";

  // Rule 1: Water & Sanitation
  if (
    text.includes("water") ||
    text.includes("sewer") ||
    text.includes("drain") ||
    text.includes("leak") ||
    text.includes("pipe") ||
    text.includes("sanitation") ||
    (text.includes("overflow") && (text.includes("water") || text.includes("sewer") || text.includes("drain") || text.includes("tank")))
  ) {
    category = "WATER_SANITATION";
    department = "WATER_SANITATION";
    environmentalImpact = text.includes("overflow") || text.includes("sewer") ? "HIGH" : "MODERATE";
    environmentalReason = "Water leakage or sewage backup compromises local hygiene and wastes clean water resources.";
    suggestedAction = "Dispatch water utility response team to inspect pipeline integrity and seal leaks.";

    if (text.includes("sewer") || text.includes("toxic") || text.includes("flood")) {
      priority = "HIGH";
      safetyRisk = "HIGH";
      safetyReason = "Exposed sewage or flooding poses contamination and public health risks.";
    }
  }
  // Rule 2: Streetlights & Electrical
  else if (
    text.includes("light") ||
    text.includes("streetlight") ||
    text.includes("wire") ||
    text.includes("electric") ||
    text.includes("power") ||
    text.includes("transformer") ||
    text.includes("spark")
  ) {
    category = "STREETLIGHTS_ELECTRICITY";
    department = "ELECTRICAL_ENERGY";
    safetyRisk = text.includes("wire") || text.includes("spark") ? "CRITICAL" : "HIGH";
    safetyReason = text.includes("wire") || text.includes("spark")
      ? "Exposed live wires present immediate electrocution hazard to pedestrians."
      : "Dark streets due to unlit lamp posts increase night-time accidents and security vulnerabilities.";
    suggestedAction = text.includes("wire")
      ? "EMERGENCY DISPATCH: Isolate electrical circuit immediately and repair exposed wiring."
      : "Schedule electrical maintenance unit to replace faulty bulbs/fuses.";

    priority = text.includes("spark") || text.includes("wire") ? "CRITICAL" : "HIGH";
  }
  // Rule 3: Waste Management & Garbage
  else if (
    text.includes("waste") ||
    text.includes("garbage") ||
    text.includes("trash") ||
    text.includes("dump") ||
    text.includes("litter") ||
    text.includes("plastic") ||
    text.includes("bin")
  ) {
    category = "WASTE_MANAGEMENT";
    department = "ENVIRONMENTAL_HEALTH";
    environmentalImpact = text.includes("dump") || text.includes("chemical") ? "HIGH" : "MODERATE";
    environmentalReason = "Accumulated waste creates vector breeding grounds and soil/air pollution.";
    suggestedAction = "Deploy sanitation crew to clear accumulated garbage and sanitize area.";
    priority = text.includes("toxic") ? "HIGH" : "MEDIUM";
  }
  // Rule 4: Roads & Infrastructure
  else if (
    text.includes("pothole") ||
    text.includes("road") ||
    text.includes("bridge") ||
    text.includes("crack") ||
    text.includes("pavement") ||
    text.includes("footpath") ||
    text.includes("asphalt")
  ) {
    category = "ROADS_INFRASTRUCTURE";
    department = "PUBLIC_WORKS";
    priority = text.includes("deep") || text.includes("major") || text.includes("hazard") ? "HIGH" : "MEDIUM";
    safetyRisk = text.includes("deep") || text.includes("highway") ? "HIGH" : "MODERATE";
    safetyReason = "Road damage and potholes can cause vehicle crashes and pedestrian tripping hazards.";
    suggestedAction = "Flag road section for pothole patching and asphalt resurfacing by Public Works.";
  }
  // Rule 5: Environmental Pollution
  else if (
    text.includes("smoke") ||
    text.includes("pollution") ||
    text.includes("chemical") ||
    text.includes("air") ||
    text.includes("factory") ||
    text.includes("smell") ||
    text.includes("stench")
  ) {
    category = "ENVIRONMENTAL_POLLUTION";
    department = "ENVIRONMENTAL_HEALTH";
    environmentalImpact = "HIGH";
    environmentalReason = "Emissions or hazardous discharge degrade local air/water quality and ecosystem health.";
    suggestedAction = "Dispatch environmental inspectors to measure contamination levels and enforce compliance.";
    priority = "HIGH";
  }
  // Rule 6: Public Safety Hazards
  else if (
    text.includes("fall") ||
    text.includes("tree") ||
    text.includes("manhole") ||
    text.includes("hazard") ||
    text.includes("collapse") ||
    text.includes("open")
  ) {
    category = "PUBLIC_SAFETY_HAZARDS";
    department = "PUBLIC_SAFETY";
    priority = "HIGH";
    safetyRisk = text.includes("manhole") || text.includes("collapse") ? "CRITICAL" : "HIGH";
    safetyReason = "Physical hazard poses high probability of personal injury if unaddressed.";
    suggestedAction = "Cordon off hazardous zone and send emergency repair team to secure area.";
  }

  // Mandatory non-empty summary creation
  const summary = input.description.length > 120
    ? `${input.title}: ${input.description.substring(0, 115)}...`
    : `${input.title} - ${input.description}`;

  return {
    category,
    priority,
    summary,
    department,
    environmentalImpact,
    environmentalReason,
    safetyRisk,
    safetyReason,
    suggestedAction,
    confidenceScore: 0.7,
  };
}
