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
import { createEvent, updateEvent, deleteEvent } from "@/actions/events";
import { getCommunityTiers } from "@/actions/tiers";
import type { Event, ContentVisibility, MembershipTier } from "@/types/database";

interface EventEditorDialogProps {
  event: Event | null;
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function EventEditorDialog({
  event,
  communitySlug,
  open,
  onOpenChange,
  onSaved,
}: EventEditorDialogProps) {
  const isEditing = !!event;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<ContentVisibility>("members");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [eventUrl, setEventUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  // Reset form when dialog opens or event changes
  useEffect(() => {
    if (open) {
      if (event) {
        setTitle(event.title);
        setDescription(event.description || "");
        setVisibility(event.visibility);
        setLocation(event.location || "");
        setStartsAt(event.starts_at ? formatDateTimeLocal(event.starts_at) : "");
        setEndsAt(event.ends_at ? formatDateTimeLocal(event.ends_at) : "");
        setEventUrl(event.external_url || "");
      } else {
        // Reset for new event
        setTitle("");
        setDescription("");
        setVisibility("members");
        setLocation("");
        setStartsAt("");
        setEndsAt("");
        setEventUrl("");
      }
      setError(null);
    }
  }, [event, open]);

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
    if (!title.trim() || !startsAt) {
      setError("Title and start date are required");
      return;
    }

    setSaving(true);
    setError(null);

    if (isEditing && event) {
      // Update existing event
      const result = await updateEvent(event.id, communitySlug, {
        title,
        description: description || null,
        visibility,
        location: location || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        event_url: eventUrl || null,
      });

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
    } else {
      // Create new event
      const result = await createEvent(communitySlug, {
        title,
        description: description || null,
        visibility,
        location: location || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        event_url: eventUrl || null,
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
    if (!event) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);
    setError(null);

    const result = await deleteEvent(event.id, communitySlug);

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
          <DialogTitle>{isEditing ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update event details and access settings"
              : "Create a new event for your community"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this event about?"
              rows={3}
            />
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts-at">Start Date & Time *</Label>
              <Input
                id="starts-at"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends-at">End Date & Time</Label>
              <Input
                id="ends-at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Zoom, Google Meet, or physical address"
            />
          </div>

          {/* Event URL */}
          <div className="space-y-2">
            <Label htmlFor="event-url">Event Link</Label>
            <Input
              id="event-url"
              type="url"
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
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
                <SelectItem value="public">Public - Anyone can see</SelectItem>
                <SelectItem value="members">Members Only</SelectItem>
                <SelectItem value="paid">Paid Members Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tier-Based Access (only for editing) */}
          {isEditing && event && (
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
                    contentType="event"
                    contentId={event.id}
                    communitySlug={communitySlug}
                    tiers={tiers}
                    initialTierId={event.min_tier_id}
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
              disabled={saving || deleting || !title.trim() || !startsAt}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to format ISO date to datetime-local input format
function formatDateTimeLocal(isoDate: string): string {
  const date = new Date(isoDate);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}
