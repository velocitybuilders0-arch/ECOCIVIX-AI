# ECOCIVIX AI — Autonomous Civic, Eco & Safety Intelligence Platform

ECOCIVIX AI is an AI-driven platform that converts citizen-reported civic, environmental, and safety issues into structured, explainable, and actionable community insights.

## Phase 1 — ML Foundation (Completed)

The Phase 1 ML Foundation establishes the server-side AI Intelligence Engine (`server/src/ai/`):

- **Gemini API Integration**: Uses Google Gemini API (`@google/genai`) with structured JSON schema output and 8-second timeout protection.
- **Strict Schema & Enum Validation**: Powered by `zod` to validate allowed categories (`ROADS_INFRASTRUCTURE`, `STREETLIGHTS_ELECTRICITY`, `WATER_SANITATION`, `WASTE_MANAGEMENT`, `PUBLIC_SAFETY_HAZARDS`, `ENVIRONMENTAL_POLLUTION`, `OTHER_CIVIC`), priorities (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), departments, environmental impact, and safety risk.
- **Deterministic Rule-Based Fallback Classifier**: Guarantees system resilience when AI provider is offline, rate-limited, or unconfigured, explicitly setting `isFallback: true`.
- **Explainability & Trust**: Answers the 5 core product questions (What is happening? How important is it? Who should act? What impact does it have? What should happen next?).

### Running AI Engine Tests & CLI

```bash
cd server
npm install
npm test              # Runs Vitest unit test suite
npm run test:ai       # Runs interactive CLI with sample civic issues
```