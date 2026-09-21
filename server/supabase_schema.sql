-- ECOCIVIX AI — Supabase Database Schema
-- Table: issues

CREATE TABLE IF NOT EXISTS public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_context TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    citizen_id VARCHAR(100) DEFAULT 'anonymous',
    ml_priority VARCHAR(20) NOT NULL CHECK (ml_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ml_confidence DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ml_model_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    ai_analysis JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    admin_note TEXT,
    assigned_department VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performant filtering
CREATE INDEX IF NOT EXISTS idx_issues_citizen_id ON public.issues (citizen_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_ml_priority ON public.issues (ml_priority);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous clients (for prototype demo)
CREATE POLICY "Allow public read access" 
ON public.issues FOR SELECT 
USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" 
ON public.issues FOR INSERT 
WITH CHECK (true);

-- Allow public update access (for status progression in demo)
CREATE POLICY "Allow public update access" 
ON public.issues FOR UPDATE 
USING (true);
