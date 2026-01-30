// Database types for Klass
// These match the Supabase schema

export type UserRole = "ADMIN" | "PAID_MEMBER" | "FREE_MEMBER";
export type UserTier = "FREE" | "PAID";
export type ContentVisibility = "public" | "members" | "paid";
export type ResourceType = "file" | "link" | "embed";
export type LayoutMode = "horizontal" | "sidebar";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "trialing";

// Pricing types
export type ContentType = "community" | "program" | "resource" | "event";
export type GrantSource = "purchase" | "manual" | "subscription" | "funnel";
export type BillingCycle = "monthly" | "yearly";

// Funnel types
export type FunnelContentType = "resource" | "program" | "community";

export interface CommunitySettings {
  layout_mode?: LayoutMode;
  show_leaderboard?: boolean;
  show_about_page?: boolean;
  banner_image_url?: string;
  banner_description?: string;
  chat_settings?: {
    enabled: boolean;
    provider: "discord" | "telegram" | "slack" | "whatsapp";
    invite_url: string;
    visibility: "members" | "paid";
  };
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  accent_color: string;
  settings_json: CommunitySettings;
  created_at: string;
  updated_at: string;
  // Pricing fields
  membership_price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  // Creator profile fields
  creator_display_name: string | null;
  creator_avatar_url: string | null;
  // Custom domain fields
  custom_domain: string | null;
  custom_domain_verified: boolean;
  custom_domain_verified_at: string | null;
}

export interface CommunityModule {
  id: string;
  community_id: string;
  key: string;
  label: string;
  enabled: boolean;
  order_index: number;
  created_at: string;
}

export interface Profile {
  id: string;
  clerk_user_id: string;
  community_id: string;
  role: UserRole;
  tier: UserTier;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  // Tier system
  membership_tier_id: string | null;
  tier_changed_at: string | null;
  // Joined fields
  membership_tier?: MembershipTier;
}

export interface Post {
  id: string;
  community_id: string;
  author_profile_id: string;
  content: string;
  media_urls: string[];
  visibility: ContentVisibility;
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_profile_id: string;
  content: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  replies?: Comment[];
}

export interface Program {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  visibility: ContentVisibility;
  published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Pricing fields
  price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  // Computed fields
  lessons_count?: number;
  completed_lessons_count?: number;
  lessons?: Lesson[];
  sections?: ProgramSection[];
}

export interface ProgramSection {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  program_id: string;
  section_id: string | null;
  title: string;
  content: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  attachment_urls: string[];
  order_index: number;
  visibility: ContentVisibility;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields
  is_completed?: boolean;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  profile_id: string;
  completed_at: string;
}

export interface Resource {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  url: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  folder: string;
  visibility: ContentVisibility;
  order_index: number;
  created_at: string;
  updated_at: string;
  // Pricing fields
  price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
}

export interface Event {
  id: string;
  community_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  external_url: string | null;
  visibility: ContentVisibility;
  created_at: string;
  updated_at: string;
  // Pricing fields
  price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  min_tier_id: string | null;
  max_attendees: number | null;
  // Joined fields
  min_tier?: MembershipTier;
}

export interface Subscription {
  id: string;
  profile_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  // Tier system
  membership_tier_id: string | null;
  billing_cycle: BillingCycle | null;
  // Joined fields
  membership_tier?: MembershipTier;
}

export interface ContentAccessGrant {
  id: string;
  profile_id: string;
  content_type: ContentType;
  content_id: string;
  source: GrantSource;
  stripe_payment_id: string | null;
  granted_by_profile_id: string | null;
  granted_at: string;
  revoked_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  profile?: Profile;
  granted_by?: Profile;
}

// Funnel types
export interface Funnel {
  id: string;
  community_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  content_type: FunnelContentType;
  content_id: string | null;
  price_cents: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  headline: string | null;
  subheadline: string | null;
  bullet_points: string[];
  cta_text: string;
  redirect_path: string;
  welcome_message: string | null;
  views_count: number;
  signups_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  community?: Community;
  content?: Program | Resource;
}

export interface FunnelConversion {
  id: string;
  funnel_id: string;
  profile_id: string;
  converted_at: string;
  source: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number | null;
  // Joined fields
  profile?: Profile;
  funnel?: Funnel;
}

// Membership tier types
export interface MembershipTier {
  id: string;
  community_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents_monthly: number;
  price_cents_yearly: number;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  tier_level: number;
  features: Record<string, unknown>;
  is_default: boolean;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ContentTierRequirement {
  id: string;
  content_type: ContentType;
  content_id: string;
  min_tier_id: string;
  created_at: string;
  // Joined fields
  min_tier?: MembershipTier;
}

// Quiz types
export type QuestionType = "multiple_choice" | "true_false" | "multi_select";

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number | null;
  randomize_questions: boolean;
  show_correct_answers: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  order_index: number;
  points: number;
  explanation: string | null;
  image_url: string | null;
  created_at: string;
  // Joined fields
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
  image_url: string | null;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  profile_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string | string[]>; // question_id -> selected option(s)
  started_at: string;
  completed_at: string;
}

export interface LessonComment {
  id: string;
  lesson_id: string;
  profile_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  replies?: LessonComment[];
}

// Platform plan types (what community creators pay KLASS)
export type PlatformPlan = "diy" | "done_with_you" | "done_for_you";

export interface PlatformSubscription {
  id: string;
  community_id: string;
  clerk_user_id: string;
  plan: PlatformPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface StripeConnectAccount {
  id: string;
  community_id: string;
  stripe_account_id: string;
  clerk_user_id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  onboarding_complete: boolean;
  platform_fee_percent: number;
  created_at: string;
  updated_at: string;
}

export interface WhopIntegration {
  id: string;
  community_id: string;
  whop_company_id: string | null;
  whop_product_id: string | null;
  whop_access_pass_id: string | null;
  api_key_encrypted: string | null;
  webhook_secret: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhopMember {
  id: string;
  community_id: string;
  whop_user_id: string;
  whop_membership_id: string | null;
  profile_id: string | null;
  email: string | null;
  status: "active" | "canceled" | "expired";
  created_at: string;
  updated_at: string;
}

// Platform plan definitions
export const PLATFORM_PLANS = {
  diy: {
    name: "DIY",
    description: "Self-serve community platform with all core features",
    price_cents: 7900,
    price_display: "$79/mo",
    features: [
      "Unlimited members",
      "Community feed & posts",
      "Programs & lessons",
      "Resource vault",
      "Events calendar",
      "Member management",
      "Basic analytics",
      "Custom branding",
    ],
  },
  done_with_you: {
    name: "Done-With-You",
    description: "Guided setup with expert support to launch your community",
    price_cents: 9900,
    price_display: "$99/mo",
    features: [
      "Everything in DIY",
      "Onboarding call",
      "Content strategy session",
      "Monthly check-in calls",
      "Priority email support",
      "Custom playbooks",
      "Affiliate system",
      "Advanced analytics",
    ],
  },
  done_for_you: {
    name: "Done-For-You",
    description: "Full white-glove setup — we build and manage your community",
    price_cents: 14900,
    price_display: "$149/mo",
    features: [
      "Everything in Done-With-You",
      "Full community setup",
      "Content migration",
      "Custom design & branding",
      "Dedicated account manager",
      "Weekly strategy calls",
      "Stripe Connect setup",
      "White-label mobile app",
    ],
  },
} as const;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      communities: {
        Row: Community;
        Insert: Omit<Community, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Community, "id" | "created_at" | "updated_at">>;
      };
      community_modules: {
        Row: CommunityModule;
        Insert: Omit<CommunityModule, "id" | "created_at">;
        Update: Partial<Omit<CommunityModule, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      posts: {
        Row: Post;
        Insert: Omit<Post, "id" | "created_at" | "updated_at" | "likes_count" | "comments_count">;
        Update: Partial<Omit<Post, "id" | "created_at" | "updated_at">>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, "id" | "created_at" | "updated_at" | "likes_count">;
        Update: Partial<Omit<Comment, "id" | "created_at" | "updated_at">>;
      };
      programs: {
        Row: Program;
        Insert: Omit<Program, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Program, "id" | "created_at" | "updated_at">>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Lesson, "id" | "created_at" | "updated_at">>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, "id" | "completed_at">;
        Update: Partial<Omit<LessonProgress, "id">>;
      };
      resources: {
        Row: Resource;
        Insert: Omit<Resource, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Resource, "id" | "created_at" | "updated_at">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id" | "created_at" | "updated_at">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
