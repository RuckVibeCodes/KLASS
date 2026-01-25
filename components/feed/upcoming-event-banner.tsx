"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Event } from "@/types/database";

interface UpcomingEventBannerProps {
  event: Event;
  communitySlug: string;
  primaryColor?: string;
}

export function UpcomingEventBanner({
  event,
  communitySlug,
  primaryColor = "#6366f1",
}: UpcomingEventBannerProps) {
  const startsAt = new Date(event.starts_at);
  const timeUntil = formatDistanceToNow(startsAt, { addSuffix: false });

  return (
    <Link href={`/${communitySlug}/events`}>
      <div
        className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
      >
        <Calendar className="h-4 w-4" />
        <span>
          <span className="font-semibold">{event.title}</span>
          {" "}is happening in {timeUntil}
        </span>
      </div>
    </Link>
  );
}
