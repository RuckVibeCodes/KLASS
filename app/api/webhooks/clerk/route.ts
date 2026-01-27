import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Missing webhook secret" },
      { status: 500 }
    );
  }

  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (evt.type) {
      case "user.deleted": {
        // Clean up all profiles for this user
        await supabase
          .from("profiles")
          .delete()
          .eq("clerk_user_id", evt.data.id);
        break;
      }

      case "user.updated": {
        // Optionally sync user data
        const { id, first_name, last_name, image_url } = evt.data;
        const displayName = [first_name, last_name].filter(Boolean).join(" ");

        // Update all profiles for this user
        if (displayName || image_url) {
          await supabase
            .from("profiles")
            .update({
              ...(displayName && { display_name: displayName }),
              ...(image_url && { avatar_url: image_url }),
            })
            .eq("clerk_user_id", id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook handler error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
