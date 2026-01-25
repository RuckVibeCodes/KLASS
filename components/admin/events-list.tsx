"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Lock,
  Clock,
  MapPin,
  Pencil,
  Crown,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { EventEditorDialog } from "./event-editor-dialog";
import type { Event } from "@/types/database";

interface EventsListProps {
  events: Event[];
  communitySlug: string;
}

export function EventsList({ events: initialEvents, communitySlug }: EventsListProps) {
  const [events] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Create events for your community to join
          </p>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {events.map((event) => {
          const eventDate = new Date(event.starts_at);
          const isEventPast = isPast(eventDate);

          return (
            <Card key={event.id} className={isEventPast ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {format(eventDate, "d")}
                      </span>
                      <span className="text-xs text-primary uppercase">
                        {format(eventDate, "MMM")}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        {event.visibility === "paid" && (
                          <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                        {event.min_tier_id && (
                          <Badge variant="outline" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Tier Gated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(eventDate, "h:mm a")}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Badge variant={isEventPast ? "outline" : "default"}>
                      {isEventPast ? "Past" : "Upcoming"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EventEditorDialog
        event={selectedEvent}
        communitySlug={communitySlug}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </>
  );
}
