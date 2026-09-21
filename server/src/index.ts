/**
 * ECOCIVIX AI — Main Express Backend Entrypoint
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { issuesRouter } from "./routes/issues.js";
import { checkMLHealth } from "./ml/mlClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", async (_req, res) => {
  const mlHealthy = await checkMLHealth();
  res.json({
    status: "ok",
    service: "ecocivix-server",
    timestamp: new Date().toISOString(),
    mlServiceConnected: mlHealthy,
  });
});

// API Routes
app.use("/api/issues", issuesRouter);

// Global 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`[ECOCIVIX] Server listening on http://localhost:${PORT}`);
});

export default app;
