import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlatformBillingPage } from "@/components/billing/platform-billing";
import type { PlatformSubscription, Community } from "@/types/database";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  // Get communities owned by this user (they're an admin of)
  const { data: adminProfiles } = await supabase
    .from("profiles")
    .select("community_id")
    .eq("clerk_user_id", userId)
    .eq("role", "ADMIN");

  const communityIds = adminProfiles?.map((p) => p.community_id) || [];

  // Get communities with their platform subscriptions
  const { data: communities } = await supabase
    .from("communities")
    .select("*")
    .in("id", communityIds.length > 0 ? communityIds : ["none"]);

  // Get platform subscriptions
  const { data: subscriptions } = await supabase
    .from("platform_subscriptions")
    .select("*")
    .eq("clerk_user_id", userId);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your KLASS platform subscription and billing
        </p>
      </div>

      <PlatformBillingPage
        communities={(communities as Community[]) || []}
        subscriptions={(subscriptions as PlatformSubscription[]) || []}
      />
    </div>
  );
}
