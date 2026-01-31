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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Crown, Trash2, Link as LinkIcon, FileUp, Code, Image as ImageIcon } from "lucide-react";
import { ContentTierSelector } from "./content-tier-selector";
import { ImageUpload } from "@/components/ui/image-upload";
import { createResource, updateResource, deleteResource } from "@/actions/resources";
import { getCommunityTiers } from "@/actions/tiers";
import { getCommunityBySlug } from "@/actions/community";
import type { Resource, ContentVisibility, ResourceType, MembershipTier } from "@/types/database";

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
  const isEditing = !!resource;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ContentVisibility>("members");
  const [folder, setFolder] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("link");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Reset form when dialog opens or resource changes
  useEffect(() => {
    if (open) {
      if (resource) {
        setTitle(resource.title);
        setDescription(resource.description || "");
        setVisibility(resource.visibility);
        setFolder(resource.folder || "");
        setResourceType(resource.type);
        setUrl(resource.url);
        setThumbnailUrl(resource.thumbnail_url || null);
      } else {
        // Reset for new resource
        setTitle("");
        setDescription("");
        setVisibility("members");
        setFolder("");
        setResourceType("link");
        setUrl("");
        setThumbnailUrl(null);
      }
      setError(null);
    }
  }, [resource, open]);

  // Load community ID for image upload
  useEffect(() => {
    async function loadCommunity() {
      const result = await getCommunityBySlug(communitySlug);
      if (result.data) {
        setCommunityId(result.data.id);
      }
    }
    if (open && communitySlug) {
      loadCommunity();
    }
  }, [communitySlug, open]);

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
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!isEditing && !url.trim()) {
      setError("URL is required");
      return;
    }

    setSaving(true);
    setError(null);

    if (isEditing && resource) {
      // Update existing resource
      const result = await updateResource(resource.id, communitySlug, {
        title,
        description: description || null,
        visibility,
        folder,
        thumbnail_url: thumbnailUrl,
      });

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
    } else {
      // Create new resource
      const result = await createResource(communitySlug, {
        title,
        description: description || undefined,
        type: resourceType,
        url,
        folder: folder || undefined,
        visibility,
        thumbnail_url: thumbnailUrl || undefined,
      });

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Resource" : "Add Resource"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update resource details and access settings"
              : "Add a link, file, or embed to your resource vault"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Resource Type Tabs (only for new) */}
          {!isEditing && (
            <Tabs value={resourceType} onValueChange={(v) => setResourceType(v as ResourceType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link" className="gap-1">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Link
                </TabsTrigger>
                <TabsTrigger value="file" className="gap-1">
                  <FileUp className="h-3.5 w-3.5" />
                  File
                </TabsTrigger>
                <TabsTrigger value="embed" className="gap-1">
                  <Code className="h-3.5 w-3.5" />
                  Embed
                </TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              </TabsContent>
              <TabsContent value="file" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="file-url">File URL *</Label>
                  <Input
                    id="file-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://storage.example.com/file.pdf"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a direct link to your file (Google Drive, Dropbox, etc.)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="embed" className="mt-3">
                <div className="space-y-2">
                  <Label htmlFor="embed-url">Embed URL *</Label>
                  <Input
                    id="embed-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    YouTube, Loom, Figma, or other embeddable content
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
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
              placeholder="Brief description of this resource"
              rows={2}
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            {communityId ? (
              <ImageUpload
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                bucket="community-assets"
                communityId={communityId}
                aspectRatio="video"
                description="Custom preview image for this resource"
              />
            ) : (
              <div className="flex items-center justify-center h-24 border border-dashed rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Folder */}
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Input
              id="folder"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g., Templates, Guides, Toolkits"
            />
            <p className="text-xs text-muted-foreground">
              Organize resources into folders (leave empty for root)
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

          {/* Tier-Based Access (only for editing) */}
          {isEditing && resource && (
            <>
              <Separator />
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
            </>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <div className="flex items-center justify-between">
          {isEditing ? (
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
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || deleting || !title.trim() || (!isEditing && !url.trim())}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Resource"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
