import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { FunnelsList } from "@/components/funnels/funnels-list";

export default async function AdminFunnelsPage({
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

  // Get funnels
  const { data: funnels } = await supabase
    .from("funnels")
    .select("*")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-6">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Funnels</h1>
          <p className="text-muted-foreground">
            {funnels?.length || 0} {funnels?.length === 1 ? "funnel" : "funnels"}
          </p>
        </div>
        <Link href={`/${communitySlug}/admin/funnels/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Funnel
          </Button>
        </Link>
      </div>

      <FunnelsList
        funnels={funnels || []}
        communitySlug={communitySlug}
      />
    </div>
  );
}
