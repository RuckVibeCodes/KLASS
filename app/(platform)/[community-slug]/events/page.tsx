import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Lock,
  CalendarDays,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", resolvedParams["community-slug"])
    .single();

  if (!community) return null;

  // Get user profile to check tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  const canAccessPaid =
    profile?.tier === "PAID" || profile?.role === "ADMIN";

  // Get events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("community_id", community.id)
    .order("starts_at", { ascending: true });

  // Split into upcoming and past
  const now = new Date();
  const upcomingEvents = events?.filter(
    (e) => new Date(e.starts_at) >= now
  ) || [];
  const pastEvents = events?.filter((e) => new Date(e.starts_at) < now) || [];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Join live sessions and workshops
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canAccess={event.visibility !== "paid" || canAccessPaid}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">
                Check back soon for new events!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Past Events
          </h2>
          <div className="space-y-4 opacity-60">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canAccess={event.visibility !== "paid" || canAccessPaid}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  canAccess,
  isPast = false,
}: {
  event: any;
  canAccess: boolean;
  isPast?: boolean;
}) {
  const startDate = new Date(event.starts_at);
  const isPaid = event.visibility === "paid";

  const getDateLabel = () => {
    if (isToday(startDate)) return "Today";
    if (isTomorrow(startDate)) return "Tomorrow";
    return format(startDate, "EEE, MMM d");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Date Box */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {format(startDate, "d")}
              </span>
              <span className="text-xs text-primary uppercase">
                {format(startDate, "MMM")}
              </span>
            </div>
          </div>

          {/* Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isPast ? "secondary" : "default"}>
                {getDateLabel()}
              </Badge>
              {isPaid && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(startDate, "h:mm a")}
              </div>
              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.description}
              </p>
            )}

            {/* Action Button */}
            {!isPast && event.external_url && (
              <>
                {canAccess ? (
                  <a
                    href={event.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Event
                    </Button>
                  </a>
                ) : (
                  <Button size="sm" disabled>
                    <Lock className="h-4 w-4 mr-2" />
                    Upgrade to Join
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
