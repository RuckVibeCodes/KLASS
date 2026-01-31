import type { FeatureFlag } from "./feature-flags";

/**
 * Default community template applied when provisioning new communities.
 * This defines the initial module configuration and settings.
 */
export const COMMUNITY_TEMPLATE = {
  modules: [
    { key: "feed", label: "Community", enabled: true, order: 0 },
    { key: "programs", label: "Classroom", enabled: true, order: 1 },
    { key: "events", label: "Calendar", enabled: true, order: 2 },
    { key: "resources", label: "Resources", enabled: true, order: 3 },
    { key: "members", label: "Members", enabled: true, order: 4 },
    { key: "chat", label: "Chat", enabled: false, order: 5 },
    { key: "about", label: "About", enabled: true, order: 6 },
  ],
  settings: {
    layout_mode: "horizontal" as const,
    show_leaderboard: false,
    show_about_page: true,
  },
};

/**
 * Plan tiers determine which features are enabled by default
 */
export type PlanTier = "standard" | "premium";

/**
 * Feature overrides based on plan tier
 */
export const PLAN_FEATURE_OVERRIDES: Record<
  PlanTier,
  Array<{ featureKey: FeatureFlag; enabled: boolean }>
> = {
  standard: [
    { featureKey: "ai_enabled", enabled: false },
    { featureKey: "dm_enabled", enabled: true },
    { featureKey: "chat_enabled", enabled: false },
    { featureKey: "affiliate_enabled", enabled: false },
  ],
  premium: [
    { featureKey: "ai_enabled", enabled: true },
    { featureKey: "dm_enabled", enabled: true },
    { featureKey: "chat_enabled", enabled: true },
    { featureKey: "affiliate_enabled", enabled: true },
  ],
};
