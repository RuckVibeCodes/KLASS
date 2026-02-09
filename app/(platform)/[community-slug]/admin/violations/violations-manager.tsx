"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Gavel,
  Shield,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  created_at: string;
  profile: { id: string; display_name: string; avatar_url: string | null } | null;
  issuer: { id: string; display_name: string } | null;
}

interface EnforcementStatus {
  id: string;
  status: string;
  total_strikes: number;
  suspended_until: string | null;
  banned_at: string | null;
  ban_reason: string | null;
  profile: { id: string; display_name: string; avatar_url: string | null } | null;
}

interface ViolationsManagerProps {
  violations: Violation[];
  enforcementStatuses: EnforcementStatus[];
  stats: {
    totalViolations: number;
    pendingAppeals: number;
    suspendedUsers: number;
    bannedUsers: number;
  };
  communityId: string;
  communitySlug: string;
}

const TYPE_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  hate_speech: "Hate Speech",
  violence: "Violence",
  adult_content: "Adult Content",
  copyright: "Copyright",
  misinformation: "Misinformation",
  illegal_activity: "Illegal Activity",
  other: "Other",
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

export function ViolationsManager({
  violations: initialViolations,
  enforcementStatuses: initialEnforcement,
  stats,
  communityId,
}: ViolationsManagerProps) {
  const [violations, setViolations] = useState(initialViolations);
  const [enforcement, setEnforcement] = useState(initialEnforcement);
  const [selectedAppeal, setSelectedAppeal] = useState<Violation | null>(null);
  const [appealNotes, setAppealNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const pendingAppeals = violations.filter((v) => v.appeal_status === "pending");

  const handleAppealDecision = async (decision: "approved" | "denied") => {
    if (!selectedAppeal) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/violations/${selectedAppeal.id}/appeal`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          notes: appealNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process appeal");
      }

      setViolations((prev) =>
        prev.map((v) =>
          v.id === selectedAppeal.id
            ? { ...v, appeal_status: decision }
            : v
        )
      );

      toast({
        title: `Appeal ${decision}`,
        description: decision === "approved" 
          ? "The violation has been removed and strike reversed." 
          : "The appeal has been denied.",
      });

      setSelectedAppeal(null);
      setAppealNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process appeal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLiftEnforcement = async (profileId: string, action: string) => {
    try {
      const response = await fetch(`/api/enforcement/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update enforcement");
      }

      setEnforcement((prev) =>
        prev.filter((e) => e.profile?.id !== profileId)
      );

      toast({
        title: "Enforcement updated",
        description: action === "lift_ban" 
          ? "User has been unbanned" 
          : "Suspension has been lifted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update enforcement",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{stats.totalViolations}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Violations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pendingAppeals}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Appeals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{stats.suspendedUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Suspended Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{stats.bannedUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Banned Users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="violations">
        <TabsList>
          <TabsTrigger value="violations">Violation History</TabsTrigger>
          <TabsTrigger value="appeals">
            Pending Appeals
            {pendingAppeals.length > 0 && (
              <Badge className="ml-2" variant="destructive">{pendingAppeals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="enforcement">Active Enforcement</TabsTrigger>
        </TabsList>

        {/* Violations Tab */}
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>Violation History</CardTitle>
            </CardHeader>
            <CardContent>
              {violations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No violations recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <div
                      key={violation.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className={`w-1 h-16 rounded-full ${SEVERITY_COLORS[violation.severity]}`} />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={violation.profile?.avatar_url || undefined} />
                        <AvatarFallback>{violation.profile?.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{violation.profile?.display_name}</span>
                          <Badge variant="outline">Strike #{violation.strike_number}</Badge>
                          <Badge>{TYPE_LABELS[violation.violation_type]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ACTION_LABELS[violation.action_taken]} • {formatDistanceToNow(new Date(violation.created_at), { addSuffix: true })}
                        </p>
                        {violation.description && (
                          <p className="text-sm">{violation.description}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          violation.appeal_status === "approved" ? "default" :
                          violation.appeal_status === "denied" ? "secondary" :
                          violation.appeal_status === "pending" ? "outline" :
                          "secondary"
                        }
                      >
                        {violation.appeal_status === "none" ? "No Appeal" : violation.appeal_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appeals Tab */}
        <TabsContent value="appeals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Appeals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingAppeals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending appeals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAppeals.map((violation) => (
                    <div
                      key={violation.id}
                      className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedAppeal(violation)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={violation.profile?.avatar_url || undefined} />
                        <AvatarFallback>{violation.profile?.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{violation.profile?.display_name}</span>
                          <Badge>{TYPE_LABELS[violation.violation_type]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Original action: {ACTION_LABELS[violation.action_taken]}
                        </p>
                        {violation.appeal_reason && (
                          <p className="text-sm mt-2 line-clamp-2">{violation.appeal_reason}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enforcement Tab */}
        <TabsContent value="enforcement">
          <Card>
            <CardHeader>
              <CardTitle>Active Enforcement</CardTitle>
            </CardHeader>
            <CardContent>
              {enforcement.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users under enforcement</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enforcement.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={status.profile?.avatar_url || undefined} />
                        <AvatarFallback>{status.profile?.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{status.profile?.display_name}</span>
                          <Badge variant={status.status === "banned" ? "destructive" : "secondary"}>
                            {status.status === "banned" ? "Banned" : "Suspended"}
                          </Badge>
                          <Badge variant="outline">{status.total_strikes} strikes</Badge>
                        </div>
                        {status.status === "suspended" && status.suspended_until && (
                          <p className="text-sm text-muted-foreground">
                            Until {new Date(status.suspended_until).toLocaleDateString()}
                          </p>
                        )}
                        {status.status === "banned" && status.ban_reason && (
                          <p className="text-sm text-muted-foreground">{status.ban_reason}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLiftEnforcement(
                          status.profile?.id || "",
                          status.status === "banned" ? "lift_ban" : "lift_suspension"
                        )}
                      >
                        {status.status === "banned" ? "Unban" : "Lift Suspension"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appeal Review Modal */}
      <Dialog open={!!selectedAppeal} onOpenChange={(open) => !open && setSelectedAppeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
            <DialogDescription>
              Review this user&apos;s appeal and make a decision
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User</span>
                  <span className="font-medium">{selectedAppeal.profile?.display_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Violation</span>
                  <Badge>{TYPE_LABELS[selectedAppeal.violation_type]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Action</span>
                  <span>{ACTION_LABELS[selectedAppeal.action_taken]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Strike #</span>
                  <span>{selectedAppeal.strike_number}</span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Appeal Reason</Label>
                <p className="mt-1 text-sm p-3 bg-muted/30 rounded-lg">
                  {selectedAppeal.appeal_reason || "No reason provided"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Decision Notes</Label>
                <Textarea
                  value={appealNotes}
                  onChange={(e) => setAppealNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAppealDecision("denied")}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Appeal
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleAppealDecision("approved")}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Appeal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
