"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Play, Pause, Ban } from "lucide-react";
import {
  pauseCommunity,
  reactivateCommunity,
  suspendCommunity,
  updateBillingStatus,
} from "@/actions/master-admin";
import type { BillingStatus } from "@/actions/master-admin";
import { useToast } from "@/hooks/use-toast";

interface CommunityStatusActionsProps {
  communityId: string;
  currentStatus: string;
  currentBillingStatus: string;
}

export function CommunityStatusActions({
  communityId,
  currentStatus,
  currentBillingStatus,
}: CommunityStatusActionsProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [billingStatus, setBillingStatus] = useState(currentBillingStatus);

  const handlePause = () => {
    startTransition(async () => {
      const result = await pauseCommunity(communityId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Community paused",
          description: "Members will see a maintenance page.",
        });
      }
    });
  };

  const handleReactivate = () => {
    startTransition(async () => {
      const result = await reactivateCommunity(communityId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Community reactivated",
          description: "Members can now access the community.",
        });
      }
    });
  };

  const handleSuspend = () => {
    if (
      !confirm(
        "Are you sure you want to suspend this community? This is more severe than pausing."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await suspendCommunity(communityId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          variant: "success",
          title: "Community suspended",
          description: "Community access has been suspended.",
        });
      }
    });
  };

  const handleBillingChange = (value: string) => {
    setBillingStatus(value);
    startTransition(async () => {
      const result = await updateBillingStatus(
        communityId,
        value as BillingStatus
      );
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setBillingStatus(currentBillingStatus);
      } else {
        toast({
          variant: "success",
          title: "Billing status updated",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Actions */}
      <div className="space-y-3">
        <Label>Community Status</Label>
        <div className="flex items-center gap-2">
          {currentStatus === "active" ? (
            <>
              <Button
                variant="outline"
                onClick={handlePause}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Pause className="h-4 w-4 mr-2" />
                )}
                Pause
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4 mr-2" />
                )}
                Suspend
              </Button>
            </>
          ) : (
            <Button onClick={handleReactivate} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Reactivate
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {currentStatus === "active"
            ? "Community is accessible to members."
            : currentStatus === "paused"
            ? "Community shows a maintenance page to members."
            : "Community is suspended and fully inaccessible."}
        </p>
      </div>

      {/* Billing Status */}
      <div className="space-y-3">
        <Label htmlFor="billing-status">Billing Status</Label>
        <Select
          value={billingStatus}
          onValueChange={handleBillingChange}
          disabled={isPending}
        >
          <SelectTrigger id="billing-status" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          For tracking purposes. Does not automatically affect access.
        </p>
      </div>
    </div>
  );
}
