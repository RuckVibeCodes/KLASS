"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  Flag,
  User,
  MessageSquare,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Report {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  severity: string | null;
  action_taken: string | null;
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: { id: string; display_name: string; avatar_url: string | null } | null;
  reported: { id: string; display_name: string; avatar_url: string | null } | null;
  resolver: { id: string; display_name: string } | null;
}

interface ReportsManagerProps {
  reports: Report[];
  stats: {
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
    total: number;
  };
  communityId: string;
}

const REASON_LABELS: Record<string, string> = {
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

const ACTION_OPTIONS = [
  { value: "no_action", label: "No Action Needed" },
  { value: "content_removed", label: "Content Removed" },
  { value: "warning_issued", label: "Warning Issued" },
  { value: "user_suspended", label: "User Suspended" },
  { value: "user_banned", label: "User Banned" },
  { value: "reported_to_authorities", label: "Reported to Authorities" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export function ReportsManager({ reports: initialReports, stats, communityId }: ReportsManagerProps) {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionTaken, setActionTaken] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredReports = filter === "all" 
    ? reports 
    : reports.filter((r) => r.status === filter);

  const handleResolve = async (status: "resolved" | "dismissed") => {
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          actionTaken: actionTaken || null,
          resolutionNotes: resolutionNotes.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report");
      }

      // Update local state
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? { ...r, status, action_taken: actionTaken, resolution_notes: resolutionNotes }
            : r
        )
      );

      toast({
        title: status === "resolved" ? "Report resolved" : "Report dismissed",
        description: "The report has been updated successfully.",
      });

      setSelectedReport(null);
      setActionTaken("");
      setResolutionNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "post": return <FileText className="h-4 w-4" />;
      case "comment": return <MessageSquare className="h-4 w-4" />;
      case "profile": return <User className="h-4 w-4" />;
      case "event": return <Calendar className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("pending")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("reviewing")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats.reviewing}</span>
            </div>
            <p className="text-sm text-muted-foreground">Reviewing</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("resolved")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats.resolved}</span>
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("dismissed")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{stats.dismissed}</span>
            </div>
            <p className="text-sm text-muted-foreground">Dismissed</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter("all")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {filter === "all" ? "All Reports" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Reports`}
            </CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {filter === "all" ? "" : filter} reports</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  {/* Severity Indicator */}
                  <div className={`w-1 h-16 rounded-full ${SEVERITY_COLORS[report.severity || "low"]}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getContentIcon(report.content_type)}
                      <span className="font-medium capitalize">{report.content_type}</span>
                      <Badge variant="outline">{REASON_LABELS[report.reason]}</Badge>
                      {report.severity && (
                        <Badge variant={report.severity === "critical" ? "destructive" : "secondary"}>
                          {report.severity}
                        </Badge>
                      )}
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.reporter && (
                        <div className="flex items-center gap-1">
                          <span>Reported by</span>
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={report.reporter.avatar_url || undefined} />
                            <AvatarFallback>{report.reporter.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{report.reporter.display_name}</span>
                        </div>
                      )}
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <Badge
                    variant={
                      report.status === "pending" ? "secondary" :
                      report.status === "resolved" ? "default" :
                      "outline"
                    }
                  >
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Report Details
            </DialogTitle>
            <DialogDescription>
              Review and take action on this report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {/* Report Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedReport.content_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <Badge>{REASON_LABELS[selectedReport.reason]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <Badge variant={selectedReport.severity === "critical" ? "destructive" : "secondary"}>
                    {selectedReport.severity || "low"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">{selectedReport.status}</Badge>
                </div>
                {selectedReport.reported && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reported User</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedReport.reported.avatar_url || undefined} />
                        <AvatarFallback>{selectedReport.reported.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{selectedReport.reported.display_name}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedReport.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1 text-sm">{selectedReport.description}</p>
                </div>
              )}

              {/* Actions (only for pending/reviewing) */}
              {(selectedReport.status === "pending" || selectedReport.status === "reviewing") && (
                <>
                  <div className="space-y-2">
                    <Label>Action Taken</Label>
                    <Select value={actionTaken} onValueChange={setActionTaken}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Resolution Notes</Label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes about how this was resolved..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleResolve("dismissed")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Dismiss
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleResolve("resolved")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Resolve
                    </Button>
                  </div>
                </>
              )}

              {/* Resolution info (for resolved/dismissed) */}
              {(selectedReport.status === "resolved" || selectedReport.status === "dismissed") && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  {selectedReport.action_taken && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Action Taken</span>
                      <span className="text-sm font-medium">
                        {ACTION_OPTIONS.find((a) => a.value === selectedReport.action_taken)?.label}
                      </span>
                    </div>
                  )}
                  {selectedReport.resolution_notes && (
                    <div>
                      <span className="text-sm text-muted-foreground">Notes</span>
                      <p className="text-sm mt-1">{selectedReport.resolution_notes}</p>
                    </div>
                  )}
                  {selectedReport.resolver && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Resolved By</span>
                      <span className="text-sm">{selectedReport.resolver.display_name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
