"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Link2,
  Users,
  Copy,
  Check,
} from "lucide-react";
import type { WhopIntegration } from "@/types/database";

interface WhopIntegrationSettingsProps {
  communityId: string;
  communitySlug: string;
  integration: WhopIntegration | null;
  whopMemberCount?: number;
}

export function WhopIntegrationSettings({
  communityId,
  communitySlug,
  integration,
  whopMemberCount = 0,
}: WhopIntegrationSettingsProps) {
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(integration?.enabled ?? false);
  const [whopProductId, setWhopProductId] = useState(
    integration?.whop_product_id || ""
  );
  const [whopAccessPassId, setWhopAccessPassId] = useState(
    integration?.whop_access_pass_id || ""
  );
  const [whopCompanyId, setWhopCompanyId] = useState(
    integration?.whop_company_id || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || ""
  }/api/whop/webhook`;

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/whop/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          communitySlug,
          enabled,
          whopProductId: whopProductId || null,
          whopAccessPassId: whopAccessPassId || null,
          whopCompanyId: whopCompanyId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save settings");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Whop settings error:", err);
      setError("Failed to save Whop settings");
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = integration && integration.whop_product_id;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Whop Distribution</CardTitle>
          </div>
          {isConfigured && enabled && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
          {isConfigured && !enabled && (
            <Badge variant="secondary">Disabled</Badge>
          )}
        </div>
        <CardDescription>
          Sell community memberships through Whop marketplace. Members who
          purchase through Whop are automatically granted access to your KLASS
          community.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="whop-toggle" className="text-base font-medium">
              Enable Whop Integration
            </Label>
            <p className="text-sm text-muted-foreground">
              Accept members from Whop marketplace purchases
            </p>
          </div>
          <Switch
            id="whop-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <>
            <Separator />

            {/* Whop IDs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whop-company">Whop Company ID</Label>
                <Input
                  id="whop-company"
                  placeholder="biz_xxxxx"
                  value={whopCompanyId}
                  onChange={(e) => setWhopCompanyId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Found in your Whop dashboard settings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whop-product">Whop Product ID</Label>
                <Input
                  id="whop-product"
                  placeholder="prod_xxxxx"
                  value={whopProductId}
                  onChange={(e) => setWhopProductId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The product ID from your Whop listing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whop-pass">
                  Whop Access Pass ID{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="whop-pass"
                  placeholder="pass_xxxxx"
                  value={whopAccessPassId}
                  onChange={(e) => setWhopAccessPassId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If your product uses access passes, enter the pass ID
                </p>
              </div>
            </div>

            <Separator />

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhook}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add this URL in your{" "}
                <a
                  href="https://dash.whop.com/developer/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Whop Dashboard → Developer → Webhooks
                </a>
              </p>
            </div>

            {/* Setup instructions */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">Setup Instructions</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                <li>
                  Create a product on{" "}
                  <a
                    href="https://dash.whop.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Whop
                  </a>{" "}
                  for your community membership
                </li>
                <li>Copy the Product ID and paste it above</li>
                <li>
                  Go to Developer → Webhooks in Whop Dashboard and add the
                  webhook URL above
                </li>
                <li>
                  Select these events:{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    membership.went_valid
                  </code>
                  ,{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    membership.went_invalid
                  </code>
                </li>
                <li>
                  Set the environment variables{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    WHOP_API_KEY
                  </code>{" "}
                  and{" "}
                  <code className="text-xs bg-muted px-1 rounded">
                    WHOP_WEBHOOK_SECRET
                  </code>{" "}
                  from your Whop dashboard
                </li>
                <li>Enable the integration and save</li>
              </ol>
            </div>

            {/* Stats */}
            {isConfigured && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Whop Members Linked
                    </span>
                  </div>
                  <span className="font-medium">{whopMemberCount}</span>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully!
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Whop Settings
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://dash.whop.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Whop Dashboard
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
