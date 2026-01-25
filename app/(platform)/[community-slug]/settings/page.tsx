"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/providers/community-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Crown, Star } from "lucide-react";
import Link from "next/link";
import { updateProfile } from "@/actions/profile";
import { ImageUpload } from "@/components/ui/image-upload";
import { BUCKETS } from "@/lib/supabase/storage-constants";

export default function SettingsPage() {
  const router = useRouter();
  const { community, profile, isAdmin } = useCommunity();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    displayName: profile?.display_name || "",
    avatarUrl: profile?.avatar_url || "",
    bio: profile?.bio || "",
  });

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile({
          profileId: profile?.id || "",
          displayName: formData.displayName,
          avatarUrl: formData.avatarUrl,
          bio: formData.bio,
          communitySlug: community.slug,
        });
        router.refresh();
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    });
  };

  return (
    <div className="container py-6 max-w-2xl">
      <Link
        href={`/${community.slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Community
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile</p>
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {/* Membership Status */}
        <Card>
          <CardHeader>
            <CardTitle>Membership</CardTitle>
            <CardDescription>Your current membership status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-sm text-muted-foreground">
                        Full access to all content and admin features
                      </p>
                    </div>
                  </>
                ) : profile?.tier === "PAID" ? (
                  <>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pro Member</p>
                      <p className="text-sm text-muted-foreground">
                        Access to all content including Pro-only features
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Free Member</p>
                      <p className="text-sm text-muted-foreground">
                        Access to free content only
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!isAdmin && profile?.tier !== "PAID" && (
                <Button disabled>Upgrade to Pro</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              How others see you in this community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={formData.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {formData.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{formData.displayName || "User"}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isAdmin ? (
                    <Badge>Admin</Badge>
                  ) : profile?.tier === "PAID" ? (
                    <Badge variant="secondary">Pro</Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your display name"
              />
            </div>

            <ImageUpload
              label="Profile Picture"
              description="Recommended size: 200x200px (square)"
              value={formData.avatarUrl || null}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url || "" })}
              bucket={BUCKETS.AVATARS}
              communityId={community.id}
              aspectRatio="square"
            />

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell others a bit about yourself..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
