"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, LayoutPanelTop, LayoutPanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { updateCommunitySettings, updateCommunityModules } from "@/actions/community";
import type { Community, CommunityModule, LayoutMode } from "@/types/database";

interface LayoutSettingsProps {
  community: Community;
  modules: CommunityModule[];
  communitySlug: string;
}

export function LayoutSettings({ community, modules, communitySlug }: LayoutSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    community.settings_json?.layout_mode || "horizontal"
  );

  const [moduleLabels, setModuleLabels] = useState<Record<string, string>>(
    modules.reduce((acc, module) => ({ ...acc, [module.key]: module.label }), {})
  );

  const [moduleEnabled, setModuleEnabled] = useState<Record<string, boolean>>(
    modules.reduce((acc, module) => ({ ...acc, [module.key]: module.enabled }), {})
  );

  const handleSave = () => {
    startTransition(async () => {
      const newSettings = {
        ...community.settings_json,
        layout_mode: layoutMode,
      };

      // Update community layout mode using server action
      const settingsResult = await updateCommunitySettings(
        community.id,
        communitySlug,
        newSettings
      );

      if (settingsResult.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save layout settings. Please try again.",
        });
        return;
      }

      // Update modules using server action
      const moduleUpdates = modules.map((module) => ({
        id: module.id,
        label: moduleLabels[module.key],
        enabled: moduleEnabled[module.key],
      }));

      const modulesResult = await updateCommunityModules(
        community.id,
        communitySlug,
        moduleUpdates
      );

      if (modulesResult.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: modulesResult.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Layout saved",
        description: "Your layout and navigation settings have been updated.",
      });

      router.refresh();
    });
  };

  return (
    <>
      {/* Layout Style */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Style</CardTitle>
          <CardDescription>
            Choose how your community navigation is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Horizontal Layout Option */}
            <button
              type="button"
              onClick={() => setLayoutMode("horizontal")}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-colors",
                layoutMode === "horizontal"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <LayoutPanelTop className="h-5 w-5" />
                </div>
                <span className="font-medium">Horizontal Nav</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Skool-style layout with tabs at the top and community info on the right
              </p>
            </button>

            {/* Sidebar Layout Option */}
            <button
              type="button"
              onClick={() => setLayoutMode("sidebar")}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-colors",
                layoutMode === "sidebar"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <LayoutPanelLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">Sidebar Nav</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Traditional layout with navigation in a left sidebar
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation Modules</CardTitle>
          <CardDescription>
            Customize labels and toggle modules on/off
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.key}
              className="flex items-center justify-between py-2"
            >
              <div className="flex-1">
                <Input
                  value={moduleLabels[module.key]}
                  onChange={(e) =>
                    setModuleLabels({
                      ...moduleLabels,
                      [module.key]: e.target.value,
                    })
                  }
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Module key: {module.key}
                </p>
              </div>
              <Switch
                checked={moduleEnabled[module.key]}
                onCheckedChange={(checked) =>
                  setModuleEnabled({
                    ...moduleEnabled,
                    [module.key]: checked,
                  })
                }
              />
            </div>
          ))}

          <div className="flex justify-end pt-4">
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
