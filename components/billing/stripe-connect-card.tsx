"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  DollarSign,
} from "lucide-react";
import type { StripeConnectAccount } from "@/types/database";

interface StripeConnectCardProps {
  connectAccount: StripeConnectAccount | null;
  communityId: string;
  communitySlug: string;
}

export function StripeConnectCard({
  connectAccount,
  communityId,
  communitySlug,
}: StripeConnectCardProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          communitySlug,
          action: "onboard",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.message === "Already connected") {
        // Already connected
      } else {
        alert(data.error || "Failed to start Stripe Connect setup");
      }
    } catch (error) {
      console.error("Connect error:", error);
      alert("Failed to start Stripe Connect setup");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          communitySlug,
          action: "dashboard",
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to open dashboard");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      alert("Failed to open Stripe dashboard");
    } finally {
      setLoading(false);
    }
  };

  const isConnected = connectAccount?.onboarding_complete;
  const isPending = connectAccount && !connectAccount.onboarding_complete;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Stripe Connect</CardTitle>
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
          {isPending && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Setup Incomplete
            </Badge>
          )}
        </div>
        <CardDescription>
          Accept payments from your community members directly to your bank
          account. KLASS takes a small 5% platform fee.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Charges</span>
              <span className="flex items-center gap-1">
                {connectAccount.charges_enabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Enabled
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Pending
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payouts</span>
              <span className="flex items-center gap-1">
                {connectAccount.payouts_enabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Enabled
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Pending
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>{connectAccount.platform_fee_percent}%</span>
            </div>
          </div>
        ) : isPending ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-yellow-800">Setup Incomplete</p>
            <p className="text-yellow-700 mt-1">
              You started connecting your Stripe account but didn&apos;t finish.
              Click below to continue the setup process.
            </p>
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p>
              Connect your Stripe account to start accepting membership payments
              from your community. Payments go directly to your bank — we only
              take a 5% platform fee.
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              <li>• Receive payments directly to your bank</li>
              <li>• Automatic invoicing and receipts</li>
              <li>• Support for cards, Apple Pay, Google Pay</li>
              <li>• Full dashboard to track earnings</li>
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        {isConnected ? (
          <Button
            variant="outline"
            onClick={handleOpenDashboard}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Stripe Dashboard
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Link2 className="h-4 w-4 mr-2" />
            {isPending ? "Continue Setup" : "Connect Stripe Account"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
