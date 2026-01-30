-- Custom domain support for communities
-- Allows creators to connect their own domain to their community

ALTER TABLE communities
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_domain_verified_at TIMESTAMPTZ;

-- Index for fast domain lookups in middleware
CREATE INDEX IF NOT EXISTS idx_communities_custom_domain 
ON communities(custom_domain) 
WHERE custom_domain IS NOT NULL;

-- Comments
COMMENT ON COLUMN communities.custom_domain IS 'Custom domain connected to this community (e.g., community.example.com)';
COMMENT ON COLUMN communities.custom_domain_verified IS 'Whether the custom domain DNS has been verified';
COMMENT ON COLUMN communities.custom_domain_verified_at IS 'When the custom domain was last verified';
