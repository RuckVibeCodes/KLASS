import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { EventsList } from "@/components/admin/events-list";

export default async function AdminEventsPage({
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

  // Get events with tier info
  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      min_tier:membership_tiers!events_min_tier_id_fkey (
        id,
        name,
        slug,
        tier_level
      )
    `)
    .eq("community_id", community.id)
    .order("starts_at", { ascending: false });

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
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">{events?.length || 0} events</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <EventsList
        events={events || []}
        communitySlug={communitySlug}
      />
    </div>
  );
}
