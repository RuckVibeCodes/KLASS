"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink, Lock } from "lucide-react";
import { useCommunity } from "@/components/providers/community-provider";

const providerLabels: Record<string, string> = {
  discord: "Discord",
  telegram: "Telegram",
  slack: "Slack",
  whatsapp: "WhatsApp",
};

const providerIcons: Record<string, string> = {
  discord: "https://cdn.simpleicons.org/discord/5865F2",
  telegram: "https://cdn.simpleicons.org/telegram/26A5E4",
  slack: "https://cdn.simpleicons.org/slack/4A154B",
  whatsapp: "https://cdn.simpleicons.org/whatsapp/25D366",
};

export default function ChatPage() {
  const router = useRouter();
  const { community, effectiveIsPaidMember } = useCommunity();

  const chatSettings = community.settings_json?.chat_settings;

  // If chat is not enabled, redirect back
  if (!chatSettings?.enabled) {
    return (
      <div className="container py-12 max-w-lg">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Chat Not Available</h2>
            <p className="text-muted-foreground">
              The community chat feature is not currently enabled.
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check visibility restrictions
  const isPaidOnly = chatSettings.visibility === "paid";
  const hasAccess = !isPaidOnly || effectiveIsPaidMember;

  if (!hasAccess) {
    return (
      <div className="container py-12 max-w-lg">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold">Paid Members Only</h2>
            <p className="text-muted-foreground">
              Access to the community chat is available exclusively to paid members.
            </p>
            <Button
              style={{ backgroundColor: community.primary_color }}
              className="text-white"
            >
              Upgrade to Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const provider = chatSettings.provider || "discord";
  const inviteUrl = chatSettings.invite_url;

  const handleOpenChat = () => {
    if (inviteUrl) {
      window.open(inviteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="container py-12 max-w-lg">
      <Card className="overflow-hidden">
        {/* Header with provider branding */}
        <div
          className="h-24 flex items-center justify-center"
          style={{ backgroundColor: `${community.primary_color}15` }}
        >
          <div className="w-20 h-20 rounded-full bg-background shadow-lg flex items-center justify-center">
            {providerIcons[provider] ? (
              <img
                src={providerIcons[provider]}
                alt={providerLabels[provider]}
                className="w-10 h-10"
              />
            ) : (
              <MessageCircle
                className="h-10 w-10"
                style={{ color: community.primary_color }}
              />
            )}
          </div>
        </div>

        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Community Chat</h1>
            <p className="text-muted-foreground">
              Real-time discussion happens in our private{" "}
              <span className="font-medium">{providerLabels[provider]}</span>{" "}
              community. Click below to join the conversation!
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-white gap-2"
            style={{ backgroundColor: community.primary_color }}
            onClick={handleOpenChat}
            disabled={!inviteUrl}
          >
            <ExternalLink className="h-5 w-5" />
            Open {providerLabels[provider]}
          </Button>

          <p className="text-xs text-muted-foreground">
            {chatSettings.visibility === "paid"
              ? "Access is available to paid members only."
              : "Access is available to all community members."}
          </p>

          {!inviteUrl && (
            <p className="text-sm text-amber-600">
              The chat invite link has not been configured yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
