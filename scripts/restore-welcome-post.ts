// Run with: npx tsx scripts/restore-welcome-post.ts
// Requires .env.local with SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const VIBE_CODE_CREW_ID = 'a958b4eb-b17b-43d8-8503-baf9e534ff89';

async function main() {
  // First, check if there are any posts
  const { data: existingPosts, error: fetchError } = await supabase
    .from('posts')
    .select('id, content, created_at')
    .eq('community_id', VIBE_CODE_CREW_ID)
    .order('created_at', { ascending: true })
    .limit(5);

  console.log('Existing posts:', existingPosts);
  if (fetchError) console.error('Fetch error:', fetchError);

  // Get admin profile
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('community_id', VIBE_CODE_CREW_ID)
    .eq('role', 'ADMIN')
    .single();

  if (!adminProfile) {
    console.error('No admin profile found');
    return;
  }

  console.log('Admin profile:', adminProfile.id);

  // Create welcome post if none exists
  if (!existingPosts || existingPosts.length === 0) {
    const welcomeContent = `👋 Welcome to Vibe Code Crew!

This is the community for builders who want to ship real apps using AI-powered development tools like Claude Code.

**What you'll find here:**
🚀 Weekly build sessions & challenges
📚 Step-by-step courses (start with "Ship Your First App in a Weekend")
💬 A community of fellow vibe coders to learn with
🎯 Accountability and support to actually ship

**First steps:**
1. Introduce yourself in the comments below
2. Check out the Programs tab for courses
3. Join a weekly challenge

Let's build something! 🔥`;

    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert({
        community_id: VIBE_CODE_CREW_ID,
        author_profile_id: adminProfile.id,
        content: welcomeContent,
        visibility: 'members',
        pinned: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
    } else {
      console.log('Created welcome post:', newPost.id);
    }
  } else {
    console.log('Posts already exist, not creating new one');
  }
}

main().catch(console.error);
