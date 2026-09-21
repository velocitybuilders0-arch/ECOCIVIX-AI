"""
ECOCIVIX AI — FastAPI Priority Inference Service
=================================================
HTTP service wrapping the fine-tuned DistilBERT priority classifier.

Endpoints:
  GET  /health          → liveness + model version check
  POST /predict         → priority prediction from title + description

Model Contract:
  Input:  { "title": str, "description": str }
  Output: {
    "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "confidence": float,         # 0.0 – 1.0
    "modelVersion": str,
    "labelScores": {
      "LOW": float, "MEDIUM": float, "HIGH": float, "CRITICAL": float
    }
  }

Usage:
  cd ml-service
  uvicorn src.api:app --host 0.0.0.0 --port 8001 --reload
"""

import os
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.predict import predict_priority, _load_model, MODEL_VERSION

# ---------------------------------------------------------------------------
# Startup: pre-warm the model so first request is not slow
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[ECOCIVIX ML] Loading model into memory on startup...")
    start = time.time()
    _load_model()
    elapsed = time.time() - start
    print(f"[ECOCIVIX ML] Model ready in {elapsed:.2f}s — version: {MODEL_VERSION}")
    yield
    print("[ECOCIVIX ML] Shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ECOCIVIX AI — Priority Inference Service",
    description="Fine-tuned DistilBERT classifier for civic issue priority prediction.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class PredictRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Issue title")
    description: str = Field(..., min_length=5, max_length=2000, description="Issue description")

class LabelScores(BaseModel):
    LOW: float
    MEDIUM: float
    HIGH: float
    CRITICAL: float

class PredictResponse(BaseModel):
    priority: str
    confidence: float
    modelVersion: str
    labelScores: LabelScores

class HealthResponse(BaseModel):
    status: str
    modelVersion: str
    service: str

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health():
    """Liveness check — confirms service is up and model is loaded."""
    return HealthResponse(
        status="ok",
        modelVersion=MODEL_VERSION,
        service="ecocivix-ml-inference",
    )

@app.post("/predict", response_model=PredictResponse, tags=["Inference"])
def predict(req: PredictRequest):
    """
    Predict priority for a civic issue.

    Returns the ML model's priority classification, confidence score,
    per-class probability scores, and the model version identifier.
    """
    try:
        result = predict_priority(title=req.title, description=req.description)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=f"Model not available: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    return PredictResponse(
        priority=result["priority"],
        confidence=round(result["confidence"], 4),
        modelVersion=result["modelVersion"],
        labelScores=LabelScores(
            LOW=round(result["labelScores"]["LOW"], 4),
            MEDIUM=round(result["labelScores"]["MEDIUM"], 4),
            HIGH=round(result["labelScores"]["HIGH"], 4),
            CRITICAL=round(result["labelScores"]["CRITICAL"], 4),
        ),
    )
