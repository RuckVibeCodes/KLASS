"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCommunitySettings } from "@/actions/community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, MessageCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Community } from "@/types/database";

type ChatProvider = "discord" | "telegram" | "slack" | "whatsapp";
type ChatVisibility = "members" | "paid";

const providerLabels: Record<ChatProvider, string> = {
  discord: "Discord",
  telegram: "Telegram",
  slack: "Slack",
  whatsapp: "WhatsApp",
};

function getPlaceholderUrl(provider: ChatProvider): string {
  switch (provider) {
    case "discord":
      return "https://discord.gg/your-invite";
    case "telegram":
      return "https://t.me/your-group";
    case "slack":
      return "https://your-workspace.slack.com/join/...";
    case "whatsapp":
      return "https://chat.whatsapp.com/your-invite";
    default:
      return "https://...";
  }
}

function getHelperText(provider: ChatProvider): string {
  switch (provider) {
    case "discord":
      return "Create a permanent invite link in your Discord server settings";
    case "telegram":
      return "Get your group invite link from Telegram group settings";
    case "slack":
      return "Create a shared channel invite link from your Slack workspace";
    case "whatsapp":
      return "Get your group invite link from WhatsApp group info";
    default:
      return "Enter the invite link for your chat platform";
  }
}

interface ChatSettingsData {
  enabled: boolean;
  provider: ChatProvider;
  invite_url: string;
  visibility: ChatVisibility;
}

interface ChatSettingsProps {
  community: Community;
  communitySlug: string;
}

export function ChatSettings({ community, communitySlug }: ChatSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Get chat settings from community settings_json or use defaults
  const defaultSettings: ChatSettingsData = {
    enabled: false,
    provider: "discord",
    invite_url: "",
    visibility: "members",
  };

  const chatSettings = community.settings_json?.chat_settings;
  const initialSettings: ChatSettingsData = {
    ...defaultSettings,
    ...(chatSettings ? chatSettings : {}),
  };

  const [settings, setSettings] = useState<ChatSettingsData>(initialSettings);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateCommunitySettings(community.id, communitySlug, {
        ...community.settings_json,
        chat_settings: settings,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save chat settings. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Chat settings saved",
        description: settings.enabled
          ? `Members can now access your ${providerLabels[settings.provider]} community.`
          : "Chat module has been disabled.",
      });

      router.refresh();
    });
  };

  const isValidUrl = (url: string) => {
    if (!url) return true; // Empty is valid when disabled
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* Chat Module Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Community Chat
          </CardTitle>
          <CardDescription>
            Link your community to an external chat platform for real-time discussions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chat-enabled">Enable Chat Module</Label>
              <p className="text-sm text-muted-foreground">
                Show a Chat tab that links to your external chat community
              </p>
            </div>
            <Switch
              id="chat-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enabled: checked })
              }
            />
          </div>

          {settings.enabled && (
            <>
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider">Chat Platform</Label>
                <Select
                  value={settings.provider}
                  onValueChange={(value: ChatProvider) =>
                    setSettings({ ...settings, provider: value })
                  }
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invite URL */}
              <div className="space-y-2">
                <Label htmlFor="invite-url">Invite URL</Label>
                <Input
                  id="invite-url"
                  value={settings.invite_url}
                  onChange={(e) =>
                    setSettings({ ...settings, invite_url: e.target.value })
                  }
                  placeholder={getPlaceholderUrl(settings.provider)}
                />
                {settings.invite_url && !isValidUrl(settings.invite_url) && (
                  <p className="text-sm text-destructive">
                    Please enter a valid HTTPS URL
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {getHelperText(settings.provider)}
                </p>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Who can access chat?</Label>
                <Select
                  value={settings.visibility}
                  onValueChange={(value: ChatVisibility) =>
                    setSettings({ ...settings, visibility: value })
                  }
                >
                  <SelectTrigger id="visibility">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">All Members</SelectItem>
                    <SelectItem value="paid">Paid Members Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settings.visibility === "paid"
                    ? "Only paid members will see the chat link"
                    : "All community members can access the chat"}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {settings.enabled && settings.invite_url && isValidUrl(settings.invite_url) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              This is how members will see the chat interstitial page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg bg-muted/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Community Chat</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time discussion happens in our private{" "}
                  {providerLabels[settings.provider]} community.
                </p>
              </div>
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open {providerLabels[settings.provider]}
              </Button>
              <p className="text-xs text-muted-foreground">
                {settings.visibility === "paid"
                  ? "Access is limited to paid members."
                  : "Access is available to all community members."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isPending || (settings.enabled && !isValidUrl(settings.invite_url))}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </>
  );
}
