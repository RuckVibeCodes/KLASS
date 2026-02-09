import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FunnelForm } from "@/components/funnels/funnel-form";

export default async function NewFunnelPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  // Get programs and resources for content selection
  const [{ data: programs }, { data: resources }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, title")
      .eq("community_id", community.id)
      .eq("published", true)
      .order("title"),
    supabase
      .from("resources")
      .select("id, title")
      .eq("community_id", community.id)
      .order("title"),
  ]);

  return (
    <FunnelForm
      communitySlug={communitySlug}
      communityId={community.id}
      programs={programs || []}
      resources={resources || []}
    />
  );
}
