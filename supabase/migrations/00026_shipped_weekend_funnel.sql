-- Create "Shipped in a Weekend" funnel
INSERT INTO funnels (
  community_id,
  title,
  slug,
  description,
  content_type,
  content_id,
  price_cents,
  headline,
  subheadline,
  bullet_points,
  cta_text,
  redirect_path,
  welcome_message,
  published
) VALUES (
  'a958b4eb-b17b-43d8-8503-baf9e534ff89',
  'Shipped in a Weekend',
  'shipped-in-a-weekend',
  'Learn to build and ship a complete app in just one weekend using AI-powered vibe coding',
  'program',
  'c1000000-0001-0001-0001-000000000001',
  0,
  'Build & Ship Your First App This Weekend',
  'No CS degree. No bootcamp. Just you, AI, and 48 hours to launch something real.',
  '["Step-by-step weekend sprint framework", "AI prompting techniques that actually work", "Deploy to production with zero DevOps headaches", "Real examples from apps shipped in < 48 hours", "Access to the Vibe Code Crew community"]'::jsonb,
  'Start Building Now',
  '/programs',
  'Welcome to Shipped in a Weekend! Check out the first module to get started.',
  true
) ON CONFLICT (community_id, slug) DO NOTHING;
