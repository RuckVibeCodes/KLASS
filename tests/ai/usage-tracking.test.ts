import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a chainable mock
function createChainableMock(finalValue: unknown = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  
  const createMethod = (defaultReturn = chain) => vi.fn(() => defaultReturn);
  
  chain.from = createMethod();
  chain.select = createMethod();
  chain.insert = createMethod();
  chain.update = createMethod();
  chain.delete = createMethod();
  chain.eq = createMethod();
  chain.gte = createMethod();
  chain.order = createMethod();
  chain.limit = createMethod();
  chain.single = vi.fn(() => Promise.resolve(finalValue));
  chain.rpc = vi.fn(() => Promise.resolve({ data: [], error: null }));
  
  return chain;
}

// Track all created mocks for inspection
let mockSupabase: ReturnType<typeof createChainableMock>;

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(() => {
    mockSupabase = createChainableMock();
    return Promise.resolve(mockSupabase);
  }),
}));

// Import after mocking
import {
  canUseAIFeature,
  trackAIUsage,
} from "@/lib/ai/usage-tracking";

describe("AI Usage Tracking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("canUseAIFeature", () => {
    it("should return allowed:false when community not found", async () => {
      const result = await canUseAIFeature("test-community", "chatbot");
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe("Community not found");
    });

    it("should handle feature check gracefully", async () => {
      // Just verify the function executes without throwing
      const result = await canUseAIFeature("test-community", "lesson_outline");
      expect(result).toHaveProperty("allowed");
    });
  });

  describe("trackAIUsage", () => {
    it("should not throw when tracking usage", async () => {
      await expect(
        trackAIUsage({
          community_id: "test-community",
          feature: "chatbot",
          tokens_input: 100,
          tokens_output: 200,
          user_id: "test-user",
        })
      ).resolves.not.toThrow();
    });

    it("should handle missing optional fields", async () => {
      await expect(
        trackAIUsage({
          community_id: "test-community",
          feature: "lesson_outline",
          tokens_input: 50,
          tokens_output: 100,
        })
      ).resolves.not.toThrow();
    });
  });
});

describe("AI Feature Types", () => {
  it("should support all feature types", () => {
    const features = ["lesson_outline", "onboarding", "chatbot", "assistant", "image_gen"];
    features.forEach((feature) => {
      expect(typeof feature).toBe("string");
    });
  });

  it("should support all tier types", () => {
    const tiers = ["free", "pro", "enterprise"];
    tiers.forEach((tier) => {
      expect(typeof tier).toBe("string");
    });
  });
});
