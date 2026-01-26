/**
 * Whop API Client
 *
 * Whop is a marketplace for selling digital products, subscriptions,
 * and community access. This integration allows KLASS communities
 * to be sold through the Whop marketplace.
 *
 * API Reference: https://dev.whop.com/reference
 * Base URL: https://api.whop.com/api/v5
 */

const WHOP_API_BASE = "https://api.whop.com/api/v5";

interface WhopApiOptions {
  apiKey: string;
}

export interface WhopUser {
  id: string;
  username: string;
  email: string;
  profile_pic_url: string | null;
}

export interface WhopMembership {
  id: string;
  product: string;
  user: string;
  plan: string;
  status: "active" | "completed" | "canceled" | "expired" | "trialing";
  license_key: string | null;
  valid: boolean;
  cancel_at_period_end: boolean;
  created_at: number;
  renewal_period_start: number;
  renewal_period_end: number;
  access_pass: string;
}

export interface WhopProduct {
  id: string;
  name: string;
  visibility: string;
  created_at: number;
}

export class WhopClient {
  private apiKey: string;

  constructor(options: WhopApiOptions) {
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${WHOP_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whop API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Validate a membership (check if a user has access)
   */
  async validateMembership(membershipId: string): Promise<WhopMembership> {
    return this.request<WhopMembership>(`/memberships/${membershipId}`);
  }

  /**
   * Check if a user has a valid membership for a product
   */
  async checkAccess(userId: string, productId: string): Promise<boolean> {
    try {
      const data = await this.request<{ data: WhopMembership[] }>(
        `/memberships?user_id=${userId}&product_id=${productId}&valid=true`
      );
      return data.data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get a user's profile
   */
  async getUser(userId: string): Promise<WhopUser> {
    return this.request<WhopUser>(`/users/${userId}`);
  }

  /**
   * List memberships for a product
   */
  async listMemberships(
    productId: string,
    page = 1,
    perPage = 50
  ): Promise<{
    data: WhopMembership[];
    pagination: { current_page: number; total_page: number };
  }> {
    return this.request(
      `/memberships?product_id=${productId}&page=${page}&per=${perPage}`
    );
  }

  /**
   * Get product details
   */
  async getProduct(productId: string): Promise<WhopProduct> {
    return this.request<WhopProduct>(`/products/${productId}`);
  }
}

/**
 * Create a Whop client from an API key
 */
export function createWhopClient(apiKey: string): WhopClient {
  return new WhopClient({ apiKey });
}

/**
 * Create a Whop client from environment variables
 */
export function createDefaultWhopClient(): WhopClient | null {
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    console.log("Whop API key not configured");
    return null;
  }
  return new WhopClient({ apiKey });
}
