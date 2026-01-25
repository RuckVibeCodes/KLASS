"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunity } from "@/components/providers/community-provider";
import { GeneralSettings } from "@/components/admin/general-settings";
import { LayoutSettings } from "@/components/admin/layout-settings";
import { PaymentsSettings } from "@/components/admin/payments-settings";
import { TiersSettings } from "@/components/admin/tiers-settings";
import { ChatSettings } from "@/components/admin/chat-settings";
import { AffiliateSettings } from "@/components/admin/affiliate-settings";
import { AdvancedSettings } from "@/components/admin/advanced-settings";

const validTabs = ["general", "layout", "payments", "tiers", "chat", "affiliates", "advanced"];

export default function AdminSettingsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const communitySlug = params["community-slug"] as string;
  const { community, modules } = useCommunity();

  // Get initial tab from URL or default to "general"
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "general";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    if (value === "general") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", value);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Sync with URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="container py-6 max-w-4xl">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your community settings and configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings community={community} communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <LayoutSettings
            community={community}
            modules={modules}
            communitySlug={communitySlug}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentsSettings community={community} communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <TiersSettings community={community} communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <ChatSettings community={community} communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-6">
          <AffiliateSettings community={community} communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedSettings community={community} communitySlug={communitySlug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
