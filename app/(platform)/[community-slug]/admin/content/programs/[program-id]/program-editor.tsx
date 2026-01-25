"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { updateProgram } from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { BUCKETS } from "@/lib/supabase/storage-constants";
import type { Program, ContentVisibility } from "@/types/database";

interface ProgramEditorProps {
  program: Program;
  communitySlug: string;
  communityId: string;
}

export function ProgramEditor({ program, communitySlug, communityId }: ProgramEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: program.title,
    description: program.description || "",
    thumbnail_url: program.thumbnail_url || "",
    visibility: program.visibility as ContentVisibility,
    published: program.published,
  });

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProgram(program.id, communitySlug, {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: formData.thumbnail_url || null,
        visibility: formData.visibility,
        published: formData.published,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save program. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Program saved",
        description: "Your changes have been saved.",
      });

      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Settings</CardTitle>
        <CardDescription>
          Configure your program details and visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Program title"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="A brief description of what this program covers..."
            rows={3}
          />
        </div>

        {/* Thumbnail */}
        <ImageUpload
          label="Thumbnail"
          description="Recommended size: 320x180px (16:9 aspect ratio)"
          value={formData.thumbnail_url || null}
          onChange={(url) => setFormData({ ...formData, thumbnail_url: url || "" })}
          bucket={BUCKETS.COMMUNITY_ASSETS}
          communityId={communityId}
          aspectRatio="video"
        />

        {/* Visibility */}
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: ContentVisibility) =>
              setFormData({ ...formData, visibility: value })
            }
          >
            <SelectTrigger id="visibility">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can view</SelectItem>
              <SelectItem value="members">Members Only - Logged in members</SelectItem>
              <SelectItem value="paid">Paid Only - Pro members only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Published Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              {formData.published ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="published" className="font-medium">
                {formData.published ? "Published" : "Draft"}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.published
                ? "This program is visible to members based on visibility settings"
                : "This program is hidden from members"}
            </p>
          </div>
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, published: checked })
            }
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending || !formData.title.trim()}>
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
  );
}
