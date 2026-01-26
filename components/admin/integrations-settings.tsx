"use client";

import { useState, useEffect } from "react";
import { StripeConnectCard } from "@/components/billing/stripe-connect-card";
import { EarningsOverview } from "@/components/billing/earnings-overview";
import { WhopIntegrationSettings } from "@/components/admin/whop-integration-settings";
import type {
  Community,
  StripeConnectAccount,
  WhopIntegration,
} from "@/types/database";

interface IntegrationsSettingsProps {
  community: Community;
  communitySlug: string;
}

export function IntegrationsSettings({
  community,
  communitySlug,
}: IntegrationsSettingsProps) {
  const [connectAccount, setConnectAccount] =
    useState<StripeConnectAccount | null>(null);
  const [whopIntegration, setWhopIntegration] =
    useState<WhopIntegration | null>(null);
  const [whopMemberCount, setWhopMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        // Fetch Stripe Connect status
        const connectRes = await fetch(
          `/api/stripe/connect/status?communityId=${community.id}`
        );
        if (connectRes.ok) {
          const connectData = await connectRes.json();
          setConnectAccount(connectData.account || null);
        }

        // Fetch Whop settings
        const whopRes = await fetch(
          `/api/whop/settings?communityId=${community.id}`
        );
        if (whopRes.ok) {
          const whopData = await whopRes.json();
          setWhopIntegration(whopData.integration || null);
          setWhopMemberCount(whopData.whopMemberCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchIntegrations();
  }, [community.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe Connect */}
      <StripeConnectCard
        connectAccount={connectAccount}
        communityId={community.id}
        communitySlug={communitySlug}
      />

      {/* Earnings Overview (only if connected) */}
      {connectAccount?.onboarding_complete && (
        <EarningsOverview
          communityId={community.id}
          communitySlug={communitySlug}
          connectAccount={connectAccount}
        />
      )}

      {/* Whop Distribution */}
      <WhopIntegrationSettings
        communityId={community.id}
        communitySlug={communitySlug}
        integration={whopIntegration}
        whopMemberCount={whopMemberCount}
      />
    </div>
  );
}
