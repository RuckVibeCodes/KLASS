"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Link, Users, DollarSign, Clock, Loader2 } from "lucide-react";
import { getOrCreateReferralCode } from "@/actions/affiliates";
import { buildReferralUrl } from "@/lib/referral";
import { useToast } from "@/hooks/use-toast";

interface ReferralEvent {
  id: string;
  event_type: "signup" | "paid_conversion";
  status: string;
  commission_cents: number | null;
  created_at: string;
}

interface AffiliateStats {
  referralCode: string | null;
  signups: number;
  paidCount: number;
  pendingCents: number;
  totalEarnedCents: number;
  recentEvents: ReferralEvent[];
}

interface AffiliateDashboardProps {
  communitySlug: string;
  stats: AffiliateStats;
  commissionRate: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function AffiliateDashboard({
  communitySlug,
  stats,
  commissionRate,
}: AffiliateDashboardProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [referralCode, setReferralCode] = useState(stats.referralCode);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralUrl = referralCode
    ? buildReferralUrl(baseUrl, communitySlug, referralCode)
    : "";

  const handleGenerateCode = () => {
    startTransition(async () => {
      const result = await getOrCreateReferralCode(communitySlug);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else if (result.data) {
        setReferralCode(result.data.code);
        toast({
          variant: "success",
          title: "Referral code generated",
        });
      }
    });
  };

  const handleCopy = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({
        variant: "success",
        title: "Link copied",
        description: "Your referral link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the link manually",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralCode ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={referralUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="outline" className="shrink-0">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with friends. When they join and upgrade, you earn{" "}
                {commissionRate}% commission.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Generate your unique referral link to start earning
              </p>
              <Button onClick={handleGenerateCode} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Referral Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.signups}</div>
                <div className="text-xs text-muted-foreground">Signups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.paidCount}</div>
                <div className="text-xs text-muted-foreground">Paid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.pendingCents)}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalEarnedCents)}
                </div>
                <div className="text-xs text-muted-foreground">Total Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No referrals yet. Share your link to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        event.event_type === "paid_conversion"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {event.event_type === "paid_conversion"
                        ? "Converted"
                        : "Signed Up"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(event.created_at)}
                    </span>
                  </div>
                  <div className="text-right">
                    {event.commission_cents ? (
                      <span className="font-medium text-green-600">
                        +{formatCurrency(event.commission_cents)}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {event.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
