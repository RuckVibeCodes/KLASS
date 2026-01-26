import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createPlatformCheckoutSession } from "@/lib/stripe/platform";
import type { PlatformPlan } from "@/types/database";

const VALID_PLANS: PlatformPlan[] = ["diy", "done_with_you", "done_for_you"];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { plan, communityId } = await req.json();

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be: diy, done_with_you, or done_for_you" },
        { status: 400 }
      );
    }

    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const result = await createPlatformCheckoutSession({
      plan,
      clerkUserId: userId,
      communityId,
      customerEmail: user.emailAddresses[0]?.emailAddress || "",
      successUrl: `${appUrl}/system-admin/billing?checkout=success`,
      cancelUrl: `${appUrl}/system-admin/billing?checkout=cancel`,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create checkout session. Stripe may not be configured." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Platform checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
