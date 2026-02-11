import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ communities: [] });
    }

    const supabase = await createAdminClient();

    // Get all communities the user is a member of
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        role,
        community:communities (
          id,
          name,
          slug,
          logo_url
        )
      `)
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("Error fetching user communities:", error);
      return NextResponse.json({ communities: [] });
    }

    // Transform to flat array of communities with role
    const communities = profiles
      ?.filter((p) => p.community)
      .map((p) => ({
        id: (p.community as any).id,
        name: (p.community as any).name,
        slug: (p.community as any).slug,
        logo_url: (p.community as any).logo_url,
        role: p.role,
      })) || [];

    return NextResponse.json({ communities });
  } catch (error) {
    console.error("Error in /api/user/communities:", error);
    return NextResponse.json({ communities: [] });
  }
}
