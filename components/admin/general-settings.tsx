"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Image as ImageIcon, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateCommunity, updateCommunitySettings } from "@/actions/community";
import { ImageUpload } from "@/components/ui/image-upload";
import { BUCKETS } from "@/lib/supabase/storage-constants";
import type { Community } from "@/types/database";

interface GeneralSettingsProps {
  community: Community;
  communitySlug: string;
}

export function GeneralSettings({ community, communitySlug }: GeneralSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description || "",
    logoUrl: community.logo_url || "",
    primaryColor: community.primary_color,
    accentColor: community.accent_color,
    bannerImageUrl: community.settings_json?.banner_image_url || "",
    bannerDescription: community.settings_json?.banner_description || "",
    creatorDisplayName: community.creator_display_name || "",
    creatorAvatarUrl: community.creator_avatar_url || "",
  });

  const handleSave = () => {
    startTransition(async () => {
      // Update basic community fields
      const communityResult = await updateCommunity(community.id, communitySlug, {
        name: formData.name,
        description: formData.description || null,
        logo_url: formData.logoUrl || null,
        primary_color: formData.primaryColor,
        accent_color: formData.accentColor,
        creator_display_name: formData.creatorDisplayName || null,
        creator_avatar_url: formData.creatorAvatarUrl || null,
      });

      if (communityResult.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save settings. Please try again.",
        });
        return;
      }

      // Update settings_json for banner
      const settingsResult = await updateCommunitySettings(community.id, communitySlug, {
        ...community.settings_json,
        banner_image_url: formData.bannerImageUrl || undefined,
        banner_description: formData.bannerDescription || undefined,
      });

      if (settingsResult.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save banner settings. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Settings saved",
        description: "Your community settings have been updated.",
      });

      router.refresh();
    });
  };

  return (
    <>
      {/* Community Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Community Information</CardTitle>
          <CardDescription>
            Basic information about your community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Community ID</Label>
              <Input value={community.id} readOnly className="bg-muted font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={community.slug} readOnly className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Created</Label>
            <Input
              value={new Date(community.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              readOnly
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Editable Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>
            Customize your community name, description, and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of your community"
              rows={3}
            />
          </div>

          <ImageUpload
            label="Community Logo"
            description="Recommended size: 200x200px (square)"
            value={formData.logoUrl || null}
            onChange={(url) => setFormData({ ...formData, logoUrl: url || "" })}
            bucket={BUCKETS.COMMUNITY_ASSETS}
            communityId={community.id}
            aspectRatio="square"
          />

          {/* Colors */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Color Preview</p>
            <div className="flex gap-4">
              <div
                className="w-20 h-10 rounded flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Primary
              </div>
              <div
                className="w-20 h-10 rounded flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: formData.accentColor }}
              >
                Accent
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Sidebar Banner
          </CardTitle>
          <CardDescription>
            Customize the community info panel shown on the right sidebar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            label="Banner Image"
            description="Recommended size: 320x128px. This image appears at the top of the community info sidebar."
            value={formData.bannerImageUrl || null}
            onChange={(url) => setFormData({ ...formData, bannerImageUrl: url || "" })}
            bucket={BUCKETS.COMMUNITY_ASSETS}
            communityId={community.id}
            aspectRatio="video"
          />

          <div className="space-y-2">
            <Label htmlFor="banner-description">Banner Description</Label>
            <Textarea
              id="banner-description"
              value={formData.bannerDescription}
              onChange={(e) => setFormData({ ...formData, bannerDescription: e.target.value })}
              placeholder="A short tagline or welcome message for your community"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              This text appears below your logo in the sidebar. If empty, your main description will be used.
            </p>
          </div>

          {/* Banner Preview */}
          {formData.bannerImageUrl && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Preview</p>
              <div className="border rounded-lg overflow-hidden max-w-xs">
                <div className="relative">
                  <img
                    src={formData.bannerImageUrl}
                    alt="Banner preview"
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="p-3 text-center">
                  <p className="font-semibold">{formData.name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.bannerDescription || formData.description || "Welcome to our community!"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Creator Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Creator Profile
          </CardTitle>
          <CardDescription>
            Your public identity as the creator of this community. This is shown on landing pages and in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creator-name">Display Name</Label>
            <Input
              id="creator-name"
              value={formData.creatorDisplayName}
              onChange={(e) => setFormData({ ...formData, creatorDisplayName: e.target.value })}
              placeholder="Your name as the community creator"
            />
            <p className="text-xs text-muted-foreground">
              This name appears alongside your avatar on the landing page and community sidebar.
            </p>
          </div>

          <ImageUpload
            label="Creator Avatar"
            description="Recommended size: 200x200px (square). Your photo or avatar as the creator."
            value={formData.creatorAvatarUrl || null}
            onChange={(url) => setFormData({ ...formData, creatorAvatarUrl: url || "" })}
            bucket={BUCKETS.AVATARS}
            communityId={community.id}
            aspectRatio="square"
          />

          {/* Creator Preview */}
          {(formData.creatorDisplayName || formData.creatorAvatarUrl) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Preview</p>
              <div className="flex items-center gap-3 p-4 border rounded-lg max-w-xs">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {formData.creatorAvatarUrl ? (
                    <img
                      src={formData.creatorAvatarUrl}
                      alt="Creator avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {formData.creatorDisplayName || "Creator Name"}
                  </p>
                  <p className="text-sm text-muted-foreground">Community Creator</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
