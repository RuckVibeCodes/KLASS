import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

interface CommunityData {
  id: string;
  slug: string;
  name: string;
}

interface ProfileWithCommunity {
  id: string;
  role: string;
  community: CommunityData | CommunityData[] | null;
}

function getCommunitySlug(community: CommunityData | CommunityData[] | null): string | null {
  if (!community) return null;
  if (Array.isArray(community)) {
    return community[0]?.slug || null;
  }
  return community.slug;
}

export default async function RedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Find the user's communities/profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      role,
      community:communities(id, slug, name)
    `)
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (!profiles || profiles.length === 0) {
    // No communities yet - redirect to create one
    redirect("/create-community");
  }

  const typedProfiles = profiles as ProfileWithCommunity[];

  // If user is admin of any community, prefer that one
  const adminProfile = typedProfiles.find((p) => p.role === "ADMIN");
  
  if (adminProfile?.community) {
    const slug = getCommunitySlug(adminProfile.community);
    if (slug) {
      redirect(`/${slug}`);
    }
  }

  // Otherwise, go to their most recent community
  const firstProfile = typedProfiles[0];
  if (firstProfile?.community) {
    const slug = getCommunitySlug(firstProfile.community);
    if (slug) {
      redirect(`/${slug}`);
    }
  }

  // Fallback: create a community
  redirect("/create-community");
}
