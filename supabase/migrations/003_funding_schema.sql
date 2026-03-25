-- SkillSeed Funding Opportunities Schema
-- Migration: 003_funding_schema.sql
-- Created: 2026-03-08

-- =============================================================================
-- FUNDING_OPPORTUNITIES TABLE
-- Stores funding opportunities posted by users
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  funder_name TEXT,
  type TEXT, -- Grant | Fellowship | In-kind Support | Partnership
  focus_areas TEXT[] DEFAULT '{}', -- array of focus areas
  eligibility TEXT,
  amount_min INT DEFAULT NULL,
  amount_max INT DEFAULT NULL,
  currency TEXT DEFAULT 'PHP',
  region TEXT,
  deadline TIMESTAMPTZ,
  apply_url TEXT,
  status TEXT DEFAULT 'active',
  saved_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- VIEW: funding_opportunities_with_closing_soon
-- Computes is_closing_soon dynamically at query time
-- =============================================================================
CREATE OR REPLACE VIEW public.funding_opportunities_view AS
SELECT 
  fo.*,
  (fo.deadline IS NOT NULL AND fo.deadline < NOW() + INTERVAL '14 days') AS is_closing_soon
FROM public.funding_opportunities fo;

-- =============================================================================
-- SAVED_FUNDING TABLE
-- Tracks which users have saved which funding opportunities
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.saved_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funding_id UUID REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funding_id, user_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_poster_id ON public.funding_opportunities(poster_id);
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_status ON public.funding_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_type ON public.funding_opportunities(type);
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_focus_areas ON public.funding_opportunities USING GIN(focus_areas);
CREATE INDEX IF NOT EXISTS idx_funding_opportunities_deadline ON public.funding_opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_saved_funding_funding_id ON public.saved_funding(funding_id);
CREATE INDEX IF NOT EXISTS idx_saved_funding_user_id ON public.saved_funding(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.funding_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_funding ENABLE ROW LEVEL SECURITY;

-- Funding opportunities policies
DROP POLICY IF EXISTS "Public read active funding" ON public.funding_opportunities;
CREATE POLICY "Public read active funding" ON public.funding_opportunities 
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Auth post funding" ON public.funding_opportunities;
CREATE POLICY "Auth post funding" ON public.funding_opportunities 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Poster can update" ON public.funding_opportunities;
CREATE POLICY "Poster can update" ON public.funding_opportunities 
  FOR UPDATE USING (poster_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Poster can delete" ON public.funding_opportunities;
CREATE POLICY "Poster can delete" ON public.funding_opportunities 
  FOR DELETE USING (poster_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Saved funding policies
DROP POLICY IF EXISTS "Auth save funding" ON public.saved_funding;
CREATE POLICY "Auth save funding" ON public.saved_funding 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Read own saved" ON public.saved_funding;
CREATE POLICY "Read own saved" ON public.saved_funding 
  FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Auth unsave" ON public.saved_funding;
CREATE POLICY "Auth unsave" ON public.saved_funding 
  FOR DELETE USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
