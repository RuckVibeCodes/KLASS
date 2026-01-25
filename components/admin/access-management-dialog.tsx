"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, X, UserPlus, Search } from "lucide-react";
import {
  getContentAccessList,
  grantContentAccess,
  revokeContentAccess,
  getCommunityMembersForGrants,
} from "@/actions/access-grants";
import type { ContentType, ContentAccessGrant } from "@/types/database";

interface MemberForGrant {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: string;
  role: string;
}

interface AccessManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  communitySlug: string;
}

export function AccessManagementDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentTitle,
  communitySlug,
}: AccessManagementDialogProps) {
  const [grants, setGrants] = useState<ContentAccessGrant[]>([]);
  const [members, setMembers] = useState<MemberForGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, contentType, contentId, communitySlug]);

  const loadData = async () => {
    setLoading(true);
    const [grantsResult, membersResult] = await Promise.all([
      getContentAccessList(contentType, contentId, communitySlug),
      getCommunityMembersForGrants(communitySlug),
    ]);

    if (grantsResult.data) {
      setGrants(grantsResult.data);
    }
    if (membersResult.data) {
      setMembers(membersResult.data);
    }
    setLoading(false);
  };

  const handleGrantAccess = async () => {
    if (!selectedMemberId) return;

    setAdding(true);
    const result = await grantContentAccess(
      selectedMemberId,
      contentType,
      contentId,
      communitySlug,
      { notes: notes || undefined }
    );

    if (result.data) {
      await loadData();
      setShowAddForm(false);
      setSelectedMemberId("");
      setNotes("");
    }
    setAdding(false);
  };

  const handleRevokeAccess = async (grantId: string) => {
    setRevoking(grantId);
    const result = await revokeContentAccess(grantId, communitySlug);

    if (!result.error) {
      await loadData();
    }
    setRevoking(null);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "purchase":
        return <Badge variant="default">Purchased</Badge>;
      case "subscription":
        return <Badge variant="secondary">Subscription</Badge>;
      case "manual":
        return <Badge variant="outline">Granted</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      member.display_name?.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>
            Control who has access to &quot;{contentTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add new grant */}
            {!showAddForm ? (
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Grant Access to Member
              </Button>
            ) : (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Grant Access</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedMemberId("");
                      setNotes("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member-search">Search Members</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="member-search"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Member</Label>
                  <Select
                    value={selectedMemberId}
                    onValueChange={setSelectedMemberId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMembers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          {members.length === 0
                            ? "All members already have access"
                            : "No matching members found"}
                        </div>
                      ) : (
                        filteredMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <span>{member.display_name || "Unknown"}</span>
                              <span className="text-muted-foreground text-xs">
                                ({member.tier})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Reason for granting access..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleGrantAccess}
                  disabled={!selectedMemberId || adding}
                  className="w-full"
                >
                  {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Plus className="h-4 w-4 mr-2" />
                  Grant Access
                </Button>
              </div>
            )}

            <Separator />

            {/* Current grants list */}
            <div>
              <Label className="text-base font-medium">
                Members with Access ({grants.length})
              </Label>
              {grants.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">
                  No explicit access grants yet. Paid tier members have access
                  automatically.
                </p>
              ) : (
                <ScrollArea className="h-[300px] mt-2">
                  <div className="space-y-2">
                    {grants.map((grant) => (
                      <div
                        key={grant.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={grant.profile?.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {getInitials(grant.profile?.display_name || null)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {grant.profile?.display_name || "Unknown"}
                            </p>
                            <div className="flex items-center gap-2">
                              {getSourceBadge(grant.source)}
                              {grant.notes && (
                                <span className="text-xs text-muted-foreground">
                                  {grant.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeAccess(grant.id)}
                          disabled={revoking === grant.id}
                        >
                          {revoking === grant.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Note: Members with PAID tier automatically have access to all paid
              content. Grants shown here are explicit overrides for individual
              access.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
