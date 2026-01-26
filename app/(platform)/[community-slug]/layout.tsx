import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { CommunityProvider } from "@/components/providers/community-provider";
import { CommunityLayout } from "@/components/layout/community-layout";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { recordReferralSignup } from "@/actions/affiliates";
import {
  getCommunityBySlug,
  getCommunityModules,
  getProfileByClerkId,
  createProfile,
  getDefaultTier,
} from "@/lib/supabase/queries";

// Increase revalidation time for faster navigation
export const revalidate = 300; // 5 minutes

export default async function CommunityLayoutPage({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  const isDemo = communitySlug === "demo";

  if (!userId && !isDemo) {
    redirect("/sign-in");
  }

  // Use cached queries for community and modules
  const community = await getCommunityBySlug(communitySlug);

  if (!community) {
    console.error("Community not found:", { communitySlug });
    notFound();
  }

  // Fetch modules and profile in parallel using cached queries
  const [modules, profile] = await Promise.all([
    getCommunityModules(community.id),
    userId ? getProfileByClerkId(userId, community.id) : Promise.resolve(null),
  ]);

  // If no profile exists, create one (non-blocking for returning users)
  let finalProfile = profile;
  if (!profile && userId) {
    // Get default tier for new members
    const defaultTierId = await getDefaultTier(community.id);
    const newProfile = await createProfile(userId, community.id, defaultTierId);

    if (newProfile) {
      finalProfile = newProfile;

      // Check for referral code in cookie and attribute if found
      const cookieStore = await cookies();
      const referralCookie = cookieStore.get("klass_ref");
      if (referralCookie?.value) {
        try {
          const referralData = JSON.parse(decodeURIComponent(referralCookie.value));
          // Only attribute if the referral is for this community
          if (referralData.code && referralData.communitySlug === communitySlug) {
            await recordReferralSignup(community.id, referralData.code, newProfile.id);
          }
        } catch {
          // Invalid cookie format, ignore
        }
      }
    }
  }

  return (
    <CommunityProvider
      community={community}
      modules={modules}
      profile={finalProfile}
    >
      <ReferralCapture communitySlug={communitySlug} />
      <CommunityLayout>{children}</CommunityLayout>
    </CommunityProvider>
  );
}
