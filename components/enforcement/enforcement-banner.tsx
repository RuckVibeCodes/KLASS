"use client";

import { formatDistanceToNow, format } from "date-fns";
import { AlertTriangle, Ban, Clock, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EnforcementBannerProps {
  status: string;
  suspendedUntil?: string | null;
  banReason?: string | null;
  totalStrikes?: number;
  communitySlug: string;
}

export function EnforcementBanner({
  status,
  suspendedUntil,
  banReason,
  totalStrikes = 0,
  communitySlug,
}: EnforcementBannerProps) {
  if (status === "good_standing") return null;

  if (status === "banned") {
    return (
      <Alert variant="destructive" className="mb-6">
        <Ban className="h-4 w-4" />
        <AlertTitle>Account Banned</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Your account has been permanently banned from this community.</p>
          {banReason && <p className="mt-1 text-sm opacity-80">Reason: {banReason}</p>}
          <div className="mt-3">
            <Link href={`/${communitySlug}/account/violations`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "suspended") {
    return (
      <Alert className="mb-6 border-orange-500 bg-orange-500/10">
        <Clock className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-orange-600 dark:text-orange-400">Account Suspended</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Your account is temporarily suspended from this community.</p>
          {suspendedUntil && (
            <p className="mt-1 text-sm">
              Access will be restored on {format(new Date(suspendedUntil), "MMMM d, yyyy")} (
              {formatDistanceToNow(new Date(suspendedUntil), { addSuffix: true })})
            </p>
          )}
          <div className="mt-3">
            <Link href={`/${communitySlug}/account/violations`}>
              <Button variant="outline" size="sm">
                View Details & Appeal
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "warned") {
    return (
      <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-600 dark:text-yellow-400">Warning Active</AlertTitle>
        <AlertDescription className="mt-2">
          <p>
            You have {totalStrikes} strike{totalStrikes !== 1 ? "s" : ""} on your account. 
            Please review our community guidelines to avoid further action.
          </p>
          <div className="mt-3">
            <Link href={`/${communitySlug}/account/violations`}>
              <Button variant="outline" size="sm">
                View Violations
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
