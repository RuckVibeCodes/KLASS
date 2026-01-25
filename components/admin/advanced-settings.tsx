"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Community } from "@/types/database";

interface AdvancedSettingsProps {
  community: Community;
  communitySlug: string;
}

export function AdvancedSettings({ community, communitySlug }: AdvancedSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const supabase = createClient();

      // Fetch all community data
      const [
        { data: posts },
        { data: comments },
        { data: members },
        { data: programs },
        { data: events },
        { data: modules },
      ] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("community_id", community.id),
        supabase
          .from("comments")
          .select("*")
          .eq("community_id", community.id),
        supabase
          .from("profiles")
          .select("id, display_name, bio, avatar_url, role, created_at")
          .eq("community_id", community.id),
        supabase
          .from("programs")
          .select("*")
          .eq("community_id", community.id),
        supabase
          .from("events")
          .select("*")
          .eq("community_id", community.id),
        supabase
          .from("community_modules")
          .select("*")
          .eq("community_id", community.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        community: {
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          settings: community.settings_json,
          created_at: community.created_at,
        },
        posts: posts || [],
        comments: comments || [],
        members: members || [],
        programs: programs || [],
        events: events || [],
        modules: modules || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${community.slug}-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        variant: "success",
        title: "Export complete",
        description: "Your community data has been downloaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export community data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteCommunity = () => {
    if (confirmName !== community.name) return;

    startTransition(async () => {
      const supabase = createClient();

      // Delete the community (cascading deletes will handle related data)
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", community.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete community. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Community deleted",
        description: "Your community has been permanently deleted.",
      });

      // Redirect to home or communities list
      router.push("/");
    });
  };

  return (
    <>
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your community data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export all your community data including posts, comments, members, programs,
            and settings. The data will be downloaded as a JSON file.
          </p>
          <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export All Data
          </Button>
          <p className="text-xs text-muted-foreground">
            This may take a few moments for large communities.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/30 rounded-lg space-y-4">
            <div>
              <h4 className="font-medium text-destructive">Delete Community</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this community and all of its data. This action cannot
                be undone. All posts, comments, members, programs, and settings will be
                permanently removed.
              </p>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Community
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      This action cannot be undone. This will permanently delete the{" "}
                      <strong>{community.name}</strong> community and remove all associated
                      data including:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>All posts and comments</li>
                      <li>All member profiles</li>
                      <li>All programs and lessons</li>
                      <li>All events and resources</li>
                      <li>All settings and customizations</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-4">
                  <Label htmlFor="confirm-name">
                    Type <strong>{community.name}</strong> to confirm
                  </Label>
                  <Input
                    id="confirm-name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={community.name}
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmName("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCommunity}
                    disabled={confirmName !== community.name || isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Community
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
