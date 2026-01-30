"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { EventEditorDialog } from "@/components/admin/event-editor-dialog";
import { EventsList } from "@/components/admin/events-list";
import { getCommunityEvents } from "@/actions/events";
import type { Event, MembershipTier } from "@/types/database";

interface EventWithTier extends Event {
  min_tier?: MembershipTier | null;
}

export default function AdminEventsPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const router = useRouter();
  const [communitySlug, setCommunitySlug] = useState<string>("");
  const [events, setEvents] = useState<EventWithTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    params.then((p) => {
      setCommunitySlug(p["community-slug"]);
    });
  }, [params]);

  useEffect(() => {
    if (!communitySlug) return;

    async function loadEvents() {
      setLoading(true);
      const result = await getCommunityEvents(communitySlug);
      if (result.data) {
        setEvents(result.data as EventWithTier[]);
      }
      setLoading(false);
    }
    loadEvents();
  }, [communitySlug]);

  const handleCreate = () => {
    setEditingEvent(null);
    setShowEditor(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEditor(true);
  };

  const handleSaved = async () => {
    setShowEditor(false);
    setEditingEvent(null);
    // Reload events
    const result = await getCommunityEvents(communitySlug);
    if (result.data) {
      setEvents(result.data as EventWithTier[]);
    }
    router.refresh();
  };

  if (!communitySlug) return null;

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
          <p className="text-muted-foreground">{events.length} events</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to engage your community
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EventsList
          events={events}
          communitySlug={communitySlug}
          onEdit={handleEdit}
        />
      )}

      <EventEditorDialog
        event={editingEvent}
        communitySlug={communitySlug}
        open={showEditor}
        onOpenChange={setShowEditor}
        onSaved={handleSaved}
      />
    </div>
  );
}
