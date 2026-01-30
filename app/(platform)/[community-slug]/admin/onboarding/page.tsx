import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { AIOnboardingGenerator } from "@/components/admin/ai-onboarding-generator";

export default async function AdminOnboardingPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", communitySlug)
    .single();

  if (!community) redirect("/");

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  if (profile?.role !== "ADMIN") {
    redirect(`/${communitySlug}`);
  }

  // Check if AI is enabled
  const aiEnabled = await isFeatureEnabled(community.id, "ai_enabled");

  return (
    <div className="container py-6">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Onboarding Generator</h1>
          <p className="text-muted-foreground">
            Generate welcome content for new members
          </p>
        </div>
      </div>

      {aiEnabled ? (
        <AIOnboardingGenerator communitySlug={communitySlug} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              AI Features Disabled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              AI features are not enabled for this community. Contact your administrator
              to enable AI-assisted content generation.
            </p>
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <p className="text-sm font-medium">What you get with AI:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Auto-generated welcome posts</li>
                <li>• First DM templates for new members</li>
                <li>• Email copy for your welcome sequence</li>
                <li>• Program lesson outlines</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
