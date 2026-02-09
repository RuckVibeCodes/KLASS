-- ============================================
-- FUNNELS (Lead Magnet Landing Pages)
-- ============================================
-- Enables creators to create standalone landing pages
-- that drive signups for specific content offers

-- ============================================
-- 1. FUNNELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  
  -- Funnel identity
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Visual
  cover_image_url TEXT,
  
  -- What they get access to
  content_type TEXT NOT NULL CHECK (content_type IN ('resource', 'program', 'community')),
  content_id UUID,  -- NULL if content_type = 'community' (just membership)
  
  -- Pricing
  price_cents INTEGER NOT NULL DEFAULT 0,  -- 0 = free
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  
  -- Landing page copy
  headline TEXT,
  subheadline TEXT,
  bullet_points JSONB DEFAULT '[]',  -- Array of benefit strings
  cta_text TEXT DEFAULT 'Get Free Access',
  
  -- After signup
  redirect_path TEXT DEFAULT '/feed',  -- Where to send after signup
  welcome_message TEXT,  -- Optional toast/modal message
  
  -- Tracking
  views_count INTEGER DEFAULT 0,
  signups_count INTEGER DEFAULT 0,
  
  -- Status
  published BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, slug)
);

-- Indexes for fast lookup
CREATE INDEX idx_funnels_community ON funnels(community_id);
CREATE INDEX idx_funnels_slug ON funnels(community_id, slug);
CREATE INDEX idx_funnels_published ON funnels(community_id, published) WHERE published = true;

-- ============================================
-- 2. FUNNEL CONVERSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS funnel_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Conversion details
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT,  -- UTM source or referrer
  
  -- Payment (if paid funnel)
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER,
  
  UNIQUE(funnel_id, profile_id)
);

-- Indexes for analytics
CREATE INDEX idx_funnel_conversions_funnel ON funnel_conversions(funnel_id);
CREATE INDEX idx_funnel_conversions_profile ON funnel_conversions(profile_id);
CREATE INDEX idx_funnel_conversions_date ON funnel_conversions(funnel_id, converted_at DESC);

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_conversions ENABLE ROW LEVEL SECURITY;

-- Funnels: Anyone can view published funnels (for public landing pages)
CREATE POLICY "anyone_view_published_funnels" ON funnels
  FOR SELECT USING (published = true);

-- Funnels: Admins can manage all funnels for their community
CREATE POLICY "admins_manage_funnels" ON funnels
  FOR ALL USING (is_community_admin(community_id));

-- Conversions: Users can view their own conversions
CREATE POLICY "users_view_own_conversions" ON funnel_conversions
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE clerk_user_id = requesting_user_id())
  );

-- Conversions: Admins can view all conversions for their funnels
CREATE POLICY "admins_view_funnel_conversions" ON funnel_conversions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funnels f
      WHERE f.id = funnel_conversions.funnel_id
      AND is_community_admin(f.community_id)
    )
  );

-- Conversions: Service role can insert (handled by server actions)
-- No INSERT policy for users means only service role can insert

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Increment funnel view count
CREATE OR REPLACE FUNCTION increment_funnel_views(funnel_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE funnels
  SET views_count = views_count + 1
  WHERE id = funnel_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment funnel signup count
CREATE OR REPLACE FUNCTION increment_funnel_signups(funnel_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE funnels
  SET signups_count = signups_count + 1
  WHERE id = funnel_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. RESERVED SLUGS CHECK
-- ============================================
-- List of reserved slugs that can't be used for funnels
-- (these match existing routes in the community)

-- Function to check if a slug is reserved
CREATE OR REPLACE FUNCTION is_reserved_funnel_slug(slug_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN slug_to_check = ANY(ARRAY[
    'admin', 'feed', 'programs', 'resources', 'events', 
    'members', 'settings', 'about', 'account', 'affiliate',
    'chat', 'pricing', 'api', 'sign-in', 'sign-up'
  ]);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
