"use server";

import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { ContentVisibility } from "@/types/database";

export async function getCommunityEvents(communitySlug: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (communityError || !community) {
    return { error: "Community not found", data: null };
  }

  // Get events with tier requirements
  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      content_tier_requirements (
        min_tier_id,
        membership_tiers (
          id,
          name,
          slug,
          tier_level
        )
      )
    `)
    .eq("community_id", community.id)
    .order("starts_at", { ascending: false });

  if (error) {
    return { error: "Failed to load events", data: null };
  }

  return { error: null, data: events };
}

export async function getEvent(eventId: string, communitySlug: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get community
  const { data: community, error: communityError } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (communityError || !community) {
    return { error: "Community not found", data: null };
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("community_id", community.id)
    .single();

  if (error) {
    return { error: "Failed to load event", data: null };
  }

  return { error: null, data: event };
}

export async function updateEvent(
  eventId: string,
  communitySlug: string,
  data: {
    title?: string;
    description?: string | null;
    visibility?: ContentVisibility;
    location?: string | null;
    starts_at?: string;
    ends_at?: string | null;
    event_url?: string | null;
    price_cents?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community and verify admin
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // Update event
  const { error } = await supabase
    .from("events")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("community_id", community.id);

  if (error) {
    return { error: "Operation failed" };
  }

  revalidatePath(`/${communitySlug}/admin/content/events`);
  revalidatePath(`/${communitySlug}/events`);

  return { error: null };
}

export async function deleteEvent(eventId: string, communitySlug: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated" };
  }

  const supabase = await createClient();

  // Get community and verify admin
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  // Delete event
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("community_id", community.id);

  if (error) {
    return { error: "Operation failed" };
  }

  revalidatePath(`/${communitySlug}/admin/content/events`);
  revalidatePath(`/${communitySlug}/events`);

  return { error: null };
}

export async function createEvent(
  communitySlug: string,
  data: {
    title: string;
    description?: string | null;
    visibility?: ContentVisibility;
    location?: string | null;
    starts_at: string;
    ends_at?: string | null;
    event_url?: string | null;
    price_cents?: number;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Not authenticated", data: null };
  }

  const supabase = await createClient();

  // Get community and verify admin
  const { data: community } = await supabase
    .from("communities")
    .select("id")
    .eq("slug", communitySlug)
    .single();

  if (!community) {
    return { error: "Community not found", data: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return { error: "Not authorized", data: null };
  }

  // Create event
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      community_id: community.id,
      title: data.title,
      description: data.description || null,
      visibility: data.visibility || "members",
      location: data.location || null,
      starts_at: data.starts_at,
      ends_at: data.ends_at || null,
      event_url: data.event_url || null,
      price_cents: data.price_cents || 0,
    })
    .select()
    .single();

  if (error) {
    return { error: "Failed to create event", data: null };
  }

  revalidatePath(`/${communitySlug}/admin/content/events`);
  revalidatePath(`/${communitySlug}/events`);

  return { error: null, data: event };
}
