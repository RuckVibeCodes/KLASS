-- Fix funnels table permissions
-- Grant full access to service_role and postgres roles

GRANT ALL ON funnels TO service_role;
GRANT ALL ON funnels TO postgres;
GRANT ALL ON funnel_conversions TO service_role;
GRANT ALL ON funnel_conversions TO postgres;

-- Also add a policy that allows service role to manage funnels
-- (service_role should bypass RLS, but adding explicit policy as backup)
DROP POLICY IF EXISTS "service_role_full_access" ON funnels;
CREATE POLICY "service_role_full_access" ON funnels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_access" ON funnel_conversions;
CREATE POLICY "service_role_full_access" ON funnel_conversions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
