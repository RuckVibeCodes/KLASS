"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ChevronRight,
  GraduationCap,
  MessageSquare,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import type { MemberSignal, MemberSignals } from "@/lib/member-signals";

interface NeedsAttentionPanelProps {
  signals: MemberSignals;
  communitySlug: string;
}

const SIGNAL_ICONS: Record<MemberSignal["type"], React.ReactNode> = {
  "new-no-post": <MessageSquare className="h-4 w-4" />,
  "inactive-14d": <UserMinus className="h-4 w-4" />,
  "program-completion": <GraduationCap className="h-4 w-4" />,
  "new-this-week": <UserPlus className="h-4 w-4" />,
};

const SIGNAL_COLORS: Record<MemberSignal["type"], string> = {
  "new-no-post": "text-amber-500",
  "inactive-14d": "text-red-500",
  "program-completion": "text-green-500",
  "new-this-week": "text-blue-500",
};

export function NeedsAttentionPanel({
  signals,
  communitySlug,
}: NeedsAttentionPanelProps) {
  const signalList = [
    signals.newNoPost,
    signals.inactive14Days,
    signals.recentCompletions,
    signals.newThisWeek,
  ].filter((s) => s.count > 0);

  const totalAttention = signalList.reduce((sum, s) => sum + s.count, 0);

  if (signalList.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Needs Attention</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All caught up!</p>
            <p className="text-xs">No members need attention right now</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Needs Attention</CardTitle>
          </div>
          <Badge variant="secondary">{totalAttention} total</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {signalList.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            communitySlug={communitySlug}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface SignalCardProps {
  signal: MemberSignal;
  communitySlug: string;
}

function SignalCard({ signal, communitySlug }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Build the members URL with optional filter
  const membersUrl = signal.filterTag
    ? `/${communitySlug}/admin/members?filter=${signal.filterTag}`
    : `/${communitySlug}/admin/members`;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${SIGNAL_COLORS[signal.type]}`}>
            {SIGNAL_ICONS[signal.type]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{signal.count}</span>
              <span className="text-sm text-muted-foreground">{signal.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {signal.description}
            </p>
          </div>
        </div>

        <Link href={membersUrl}>
          <Button variant="outline" size="sm" className="gap-1">
            <Users className="h-3 w-3" />
            View
          </Button>
        </Link>
      </div>

      {/* Preview of affected members */}
      {signal.members && signal.members.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {signal.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {member.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {signal.count > 4 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{signal.count - 4}
                </span>
              </div>
            )}
          </div>

          {signal.members.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "Hide names" : "Show names"}
            </button>
          )}
        </div>
      )}

      {/* Expanded member names */}
      {expanded && signal.members && signal.members.length > 0 && (
        <div className="text-xs text-muted-foreground pl-7">
          {signal.members.slice(0, 10).map((m) => m.display_name || "Unknown").join(", ")}
          {signal.count > 10 && ` and ${signal.count - 10} more...`}
        </div>
      )}
    </div>
  );
}
