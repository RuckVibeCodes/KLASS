import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCommunityBySlug, getProfileByClerkId } from "@/lib/supabase/queries";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];

  if (!userId) {
    redirect("/sign-in");
  }

  const community = await getCommunityBySlug(communitySlug);
  if (!community) redirect("/");

  const profile = await getProfileByClerkId(userId, community.id);

  if (!profile || profile.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  return <>{children}</>;
}
