import { getSystemFeatureFlags } from "@/lib/feature-flags";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FeatureFlagsList } from "./feature-flags-list";

export default async function FeatureFlagsPage() {
  const flags = await getSystemFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground">
          Manage system-wide feature defaults. Per-community overrides can be
          set in each community&apos;s settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Defaults</CardTitle>
          <CardDescription>
            These are the default values for all communities. Individual
            communities can override these values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureFlagsList flags={flags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flag Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <ul className="space-y-2 text-sm">
            <li>
              <code>ai_enabled</code> - Enables AI-assisted content generation
              features
            </li>
            <li>
              <code>dm_enabled</code> - Enables direct messaging between creators
              and members
            </li>
            <li>
              <code>chat_enabled</code> - Enables external chat integration
              (Discord/Telegram link-out)
            </li>
            <li>
              <code>playbooks_enabled</code> - Enables guided playbook workflows
              for creators
            </li>
            <li>
              <code>affiliate_enabled</code> - Enables affiliate/referral
              tracking system
            </li>
            <li>
              <code>quizzes_enabled</code> - Enables quiz assessments on lessons
            </li>
            <li>
              <code>events_enabled</code> - Enables community events module
            </li>
            <li>
              <code>resources_enabled</code> - Enables resource vault module
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
