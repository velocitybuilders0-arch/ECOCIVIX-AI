/**
 * ECOCIVIX AI — Issues Router
 * POST /api/analyze  — Run ML priority + LLM analysis on issue text
 * POST /api/issues   — Submit and persist issue to Supabase
 * GET  /api/issues   — List issues (citizen: own; admin: all)
 * GET  /api/issues/:id — Single issue detail
 * PATCH /api/issues/:id/status — Admin status update
 */
import { Router, Request, Response } from "express";
import { z } from "zod";
import { analyzeIssue } from "../ai/aiEngine.js";
import { callMLService, checkMLHealth } from "../ml/mlClient.js";
import { supabase } from "../db/supabaseClient.js";
import { AuthenticatedRequest, requireAdmin, requireAuth } from "../authMiddleware.js";

export const issuesRouter = Router();
issuesRouter.use(requireAuth);

// --------------------------------------------------------------------------
// Validation schemas
// --------------------------------------------------------------------------
const AnalyzeBodySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  locationContext: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});
const SubmitIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  locationContext: z.string().optional(),
  imageUrl: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  citizenId: z.string().optional(),
  // ML result (sent from client after analysis)
  mlPriority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  mlConfidence: z.number().min(0).max(1),
  mlModelVersion: z.string(),
  // LLM analysis (sent from client after analysis)
  aiAnalysis: z.record(z.unknown()).optional(),
});
const StatusUpdateSchema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  adminNote: z.string().optional(),
  assignedDepartment: z.string().optional(),
});

// --------------------------------------------------------------------------
// POST /api/analyze
// Runs the dual-AI pipeline: ML priority classifier + Gemini LLM analysis
// --------------------------------------------------------------------------
issuesRouter.post("/analyze", async (req: Request, res: Response) => {
  const parsed = AnalyzeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const input = parsed.data;

  // Step 1: Call ML priority classifier (mandatory)
  let mlResult;
  try {
    mlResult = await callMLService(input.title, input.description);
  } catch (mlErr: unknown) {
    const msg = mlErr instanceof Error ? mlErr.message : String(mlErr);
    console.error(`[ECOCIVIX] ML service error: ${msg}`);
    return res.status(503).json({
      error: "ML inference service unavailable. Please ensure the Python FastAPI service is running on port 8001.",
      detail: msg,
    });
  }

  // Step 2: Call Gemini LLM contextual analysis (optional — degrades gracefully)
  let llmAnalysis = null;
  let llmFailed = false;
  try {
    llmAnalysis = await analyzeIssue(input);
  } catch (llmErr: unknown) {
    llmFailed = true;
    console.warn("[ECOCIVIX] LLM analysis failed — returning ML-only result:", llmErr);
  }

  // Always return the analysis (whether from Gemini or fallback classifier)
  // The mobile client uses the isFallback flag to show appropriate UI
  return res.status(200).json({
    // Core ML output (the real trained model)
    priority: mlResult.priority,
    confidence: mlResult.confidence,
    modelVersion: mlResult.modelVersion,
    labelScores: mlResult.labelScores,
    // LLM contextual analysis (second AI layer - includes fallback if Gemini failed)
    aiAnalysis: llmAnalysis,
    llmAvailable: !llmFailed,
    analyzedAt: new Date().toISOString(),
    isFallback: llmAnalysis?.isFallback ?? false,
  });
});

// --------------------------------------------------------------------------
// POST /api/issues
// Persist a submitted issue to Supabase
// --------------------------------------------------------------------------
issuesRouter.post("/", async (req: Request, res: Response) => {
  const parsed = SubmitIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid issue data", details: parsed.error.flatten() });
  }

  const data = parsed.data;

  const { data: inserted, error } = await supabase
    .from("issues")
    .insert([
      {
        title: data.title,
        description: data.description,
        location_context: data.locationContext ?? null,
        image_url: data.imageUrl ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        citizen_id: (req as AuthenticatedRequest).authUser?.id,
        ml_priority: data.mlPriority,
        ml_confidence: data.mlConfidence,
        ml_model_version: data.mlModelVersion,
        ai_analysis: data.aiAnalysis ?? null,
        status: "OPEN",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[ECOCIVIX] Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to persist issue", detail: error.message });
  }

  return res.status(201).json({ message: "Issue submitted successfully", issue: inserted });
});

// --------------------------------------------------------------------------
// GET /api/issues
// List issues — supports ?citizenId=xxx and ?status=OPEN filters
// --------------------------------------------------------------------------
issuesRouter.get("/", async (req: Request, res: Response) => {
  const { status, limit = "20", offset = "0" } = req.query;
  const request = req as AuthenticatedRequest;
  const isOperationsUser = request.authUser?.app_metadata?.role === "admin" || request.authUser?.app_metadata?.role === "staff";

  let query = supabase
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (!isOperationsUser) query = query.eq("citizen_id", request.authUser?.id ?? "");
  if (status) query = query.eq("status", String(status));

  const { data, error } = await query;

  if (error) {
    console.error("[ECOCIVIX] Supabase fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch issues", detail: error.message });
  }

  return res.status(200).json({ issues: data, count: data?.length ?? 0 });
});

// --------------------------------------------------------------------------
// GET /api/issues/:id
// Single issue detail
// --------------------------------------------------------------------------
issuesRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const request = req as AuthenticatedRequest;
  const isOperationsUser = request.authUser?.app_metadata?.role === "admin" || request.authUser?.app_metadata?.role === "staff";

  const { data, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Issue not found" });
  }

  if (!isOperationsUser && data.citizen_id !== request.authUser?.id) {
    return res.status(404).json({ error: "Issue not found" });
  }

  return res.status(200).json({ issue: data });
});

// --------------------------------------------------------------------------
// PATCH /api/issues/:id/status
// Admin status update
// --------------------------------------------------------------------------
issuesRouter.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = StatusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status update", details: parsed.error.flatten() });
  }

  const { status, adminNote, assignedDepartment } = parsed.data;

  const updatePayload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNote) updatePayload.admin_note = adminNote;
  if (assignedDepartment) updatePayload.assigned_department = assignedDepartment;

  const { data, error } = await supabase
    .from("issues")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[ECOCIVIX] Supabase update error:", error);
    return res.status(500).json({ error: "Failed to update status", detail: error.message });
  }

  return res.status(200).json({ message: "Status updated", issue: data });
});

