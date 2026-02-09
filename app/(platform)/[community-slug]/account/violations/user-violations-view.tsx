"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Shield,
  AlertCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Violation {
  id: string;
  violation_type: string;
  severity: string;
  description: string | null;
  strike_number: number;
  action_taken: string;
  appeal_status: string;
  appeal_reason: string | null;
  appeal_reviewed_at: string | null;
  created_at: string;
  issuer: { id: string; display_name: string } | null;
  appeal_reviewer: { id: string; display_name: string } | null;
}

interface Enforcement {
  id: string;
  status: string;
  total_strikes: number;
  suspended_until: string | null;
  banned_at: string | null;
  ban_reason: string | null;
}

interface UserViolationsViewProps {
  violations: Violation[];
  enforcement: Enforcement | null;
  communityId: string;
  communitySlug: string;
}

const TYPE_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  violence: "Violence",
  adult_content: "Adult Content",
  copyright: "Copyright Violation",
  misinformation: "Misinformation",
  illegal_activity: "Illegal Activity",
  other: "Policy Violation",
};

const ACTION_LABELS: Record<string, string> = {
  warning: "Warning",
  content_removed: "Content Removed",
  suspension_7_days: "7-Day Suspension",
  suspension_30_days: "30-Day Suspension",
  permanent_ban: "Permanent Ban",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  severe: "bg-orange-500",
  moderate: "bg-yellow-500",
  minor: "bg-blue-500",
};

export function UserViolationsView({
  violations: initialViolations,
  enforcement,
  communityId,
}: UserViolationsViewProps) {
  const [violations, setViolations] = useState(initialViolations);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [appealReason, setAppealReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const canAppeal = (violation: Violation) => {
    return violation.appeal_status === "none" && violation.action_taken !== "warning";
  };

  const handleSubmitAppeal = async () => {
    if (!selectedViolation || !appealReason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/violations/${selectedViolation.id}/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: appealReason.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit appeal");
      }

      setViolations((prev) =>
        prev.map((v) =>
          v.id === selectedViolation.id
            ? { ...v, appeal_status: "pending", appeal_reason: appealReason.trim() }
            : v
        )
      );

      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been submitted for review.",
      });

      setSelectedViolation(null);
      setAppealReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit appeal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    if (!enforcement) {
      return {
        icon: Shield,
        color: "text-green-500",
        bg: "bg-green-500/10",
        title: "Good Standing",
        description: "You have no violations on your account.",
      };
    }

    switch (enforcement.status) {
      case "banned":
        return {
          icon: Ban,
          color: "text-red-500",
          bg: "bg-red-500/10",
          title: "Banned",
          description: enforcement.ban_reason || "You have been permanently banned from this community.",
        };
      case "suspended":
        return {
          icon: Clock,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          title: "Suspended",
          description: enforcement.suspended_until
            ? `Your access is suspended until ${format(new Date(enforcement.suspended_until), "MMMM d, yyyy")}`
            : "Your access has been suspended.",
        };
      case "warned":
        return {
          icon: AlertTriangle,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          title: "Warning Active",
          description: `You have ${enforcement.total_strikes} strike(s) on your account. Further violations may result in suspension.`,
        };
      default:
        return {
          icon: Shield,
          color: "text-green-500",
          bg: "bg-green-500/10",
          title: "Good Standing",
          description: "You have no active enforcement actions.",
        };
    }
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className={status.bg}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${status.bg}`}>
              <StatusIcon className={`h-6 w-6 ${status.color}`} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${status.color}`}>{status.title}</h3>
              <p className="text-muted-foreground">{status.description}</p>
              {enforcement && enforcement.total_strikes > 0 && (
                <div className="mt-2">
                  <Badge variant="outline">{enforcement.total_strikes} Strike(s)</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strike Policy Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Community Strike Policy</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
            <li>Strike 1: Warning</li>
            <li>Strike 2: 7-day suspension</li>
            <li>Strike 3: 30-day suspension</li>
            <li>Strike 4: Permanent ban</li>
          </ul>
          <p className="mt-2 text-sm">
            Critical violations (violence, illegal activity) may result in immediate permanent bans.
          </p>
        </AlertDescription>
      </Alert>

      {/* Violation History */}
      <Card>
        <CardHeader>
          <CardTitle>Violation History</CardTitle>
          <CardDescription>
            Your record of community guideline violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p>No violations on record</p>
              <p className="text-sm">Keep up the good work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className={`w-1 h-full min-h-[80px] rounded-full ${SEVERITY_COLORS[violation.severity]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline">Strike #{violation.strike_number}</Badge>
                      <Badge>{TYPE_LABELS[violation.violation_type]}</Badge>
                      {violation.appeal_status !== "none" && (
                        <Badge
                          variant={
                            violation.appeal_status === "approved" ? "default" :
                            violation.appeal_status === "denied" ? "destructive" :
                            "secondary"
                          }
                        >
                          Appeal {violation.appeal_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-2">
                      {ACTION_LABELS[violation.action_taken]}
                    </p>
                    {violation.description && (
                      <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(violation.created_at), { addSuffix: true })}
                    </p>
                    
                    {/* Appeal Status Details */}
                    {violation.appeal_status === "pending" && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="font-medium text-yellow-600 dark:text-yellow-400">Appeal Pending</p>
                        <p className="text-muted-foreground">Your appeal is being reviewed by the moderation team.</p>
                      </div>
                    )}
                    {violation.appeal_status === "approved" && (
                      <div className="mt-3 p-3 bg-green-500/10 rounded-lg text-sm">
                        <p className="font-medium text-green-600 dark:text-green-400">Appeal Approved</p>
                        <p className="text-muted-foreground">This violation has been removed from your record.</p>
                      </div>
                    )}
                    {violation.appeal_status === "denied" && (
                      <div className="mt-3 p-3 bg-red-500/10 rounded-lg text-sm">
                        <p className="font-medium text-red-600 dark:text-red-400">Appeal Denied</p>
                        <p className="text-muted-foreground">The moderation team upheld this violation.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Appeal Button */}
                  {canAppeal(violation) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedViolation(violation)}
                    >
                      Appeal
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal Modal */}
      <Dialog open={!!selectedViolation} onOpenChange={(open) => !open && setSelectedViolation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
            <DialogDescription>
              Explain why you believe this violation should be reconsidered.
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Violation Type</span>
                  <Badge>{TYPE_LABELS[selectedViolation.violation_type]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Action Taken</span>
                  <span>{ACTION_LABELS[selectedViolation.action_taken]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(selectedViolation.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Why should this be reconsidered?</label>
                <Textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Provide context or explain why you believe this decision was incorrect..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Be respectful and provide relevant details. Appeals are reviewed by the moderation team.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedViolation(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAppeal}
              disabled={!appealReason.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Submit Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
