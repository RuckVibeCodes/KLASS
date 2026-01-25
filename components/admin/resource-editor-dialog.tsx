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
import { Separator } from "@/components/ui/separator";
import { Loader2, Crown, Trash2 } from "lucide-react";
import { ContentTierSelector } from "./content-tier-selector";
import { updateResource, deleteResource } from "@/actions/resources";
import { getCommunityTiers } from "@/actions/tiers";
import type { Resource, ContentVisibility, MembershipTier } from "@/types/database";

interface ResourceEditorDialogProps {
  resource: Resource | null;
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function ResourceEditorDialog({
  resource,
  communitySlug,
  open,
  onOpenChange,
  onSaved,
}: ResourceEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ContentVisibility>("members");
  const [folder, setFolder] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Reset form when resource changes
  useEffect(() => {
    if (resource) {
      setTitle(resource.title);
      setDescription(resource.description || "");
      setVisibility(resource.visibility);
      setFolder(resource.folder || "");
    }
  }, [resource]);

  // Load tiers on mount
  useEffect(() => {
    async function loadTiers() {
      setTiersLoading(true);
      const result = await getCommunityTiers(communitySlug);
      if (result.data) {
        setTiers(result.data);
      }
      setTiersLoading(false);
    }
    if (open) {
      loadTiers();
    }
  }, [communitySlug, open]);

  const handleSave = async () => {
    if (!resource) return;

    setSaving(true);
    setError(null);

    const result = await updateResource(resource.id, communitySlug, {
      title,
      description: description || null,
      visibility,
      folder,
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!resource) return;
    if (!confirm("Are you sure you want to delete this resource?")) return;

    setDeleting(true);
    setError(null);

    const result = await deleteResource(resource.id, communitySlug);

    if (result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    onSaved?.();
    onOpenChange(false);
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>
            Update resource details and access settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Folder */}
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Input
              id="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g., Templates, Guides"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for root folder
            </p>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value: ContentVisibility) => setVisibility(value)}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can access</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
                <SelectItem value="paid">Paid Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tier-Based Access */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-muted-foreground" />
              <Label>Membership Tier Access</Label>
            </div>

            {tiersLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tiers...
              </div>
            ) : (
              <ContentTierSelector
                contentType="resource"
                contentId={resource.id}
                communitySlug={communitySlug}
                tiers={tiers}
              />
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span className="ml-2">Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting || !title.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
