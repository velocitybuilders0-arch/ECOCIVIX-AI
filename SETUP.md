# ECOCIVIX AI — Local Setup

## Prerequisites
- Node.js 18+, Python 3.10+, Expo CLI
- A free Supabase account
- A free Gemini API key

## 1. Supabase (free)
- Sign up at https://supabase.com
- Create a project named `ecocivix-ai`
- Open SQL Editor, paste the contents of `server/supabase_schema.sql`, and run it
- In Project Settings → API, copy:
  - Project URL → `SUPABASE_URL`
  - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Gemini API key (free)
- Go to https://aistudio.google.com/apikey
- Create an API key
- No credit card required
- Copy it → `GEMINI_API_KEY`

## 3. Create .env files
- `cp server/.env.example server/.env`
- `cp ml-service/.env.example ml-service/.env`
- `cp mobile/.env.example mobile/.env`
- Fill in the values in `server/.env`

## 4. Install dependencies
- `cd server && npm install`
- `cd ml-service && pip install -r requirements.txt`
- `cd mobile && npm install`

## 5. Run all three services (three terminals)
- Terminal 1: `cd ml-service && uvicorn src.api:app --host 0.0.0.0 --port 8001`
- Terminal 2: `cd server && npm run dev`
- Terminal 3: `cd mobile && npx expo start`

## 6. Verify the real ML path
- `curl http://localhost:8001/health` → expect `OK`
- `curl http://localhost:3000/health` → expect ML + Supabase status
- In the app, report an issue and tap Analyze
- Expected: real priority, no offline-fallback banner

## 7. Running on a physical Android phone
- Find your laptop's LAN IP: `ipconfig` (Windows) or `ifconfig | grep inet` (macOS/Linux)
- In `mobile/.env`, set:
  `EXPO_PUBLIC_API_URL=http://<LAN_IP>:3000`
- Both phone and laptop must be on the same Wi-Fi
- Restart Expo after changing `.env`

## Code configuration notes
- The server currently reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `server/src/db/supabaseClient.ts`; it does not currently read `SUPABASE_SERVICE_ROLE_KEY`.
- The ML service currently hardcodes `models/priority-v1.0.0` in `ml-service/src/predict.py`; it does not currently read `MODEL_PATH`.
- The mobile backend URL is currently hardcoded as `http://localhost:3000/api/issues` in `mobile/src/services/api.ts`; it does not currently read `EXPO_PUBLIC_API_URL`.
