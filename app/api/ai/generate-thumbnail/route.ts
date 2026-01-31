import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  isGeminiAvailable,
  generateProgramThumbnail,
  uploadProgramImage,
} from "@/lib/ai/gemini";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      programId, 
      communityId, 
      title, 
      description,
      primaryColor,
      accentColor 
    } = await req.json();

    if (!programId || !communityId || !title) {
      return NextResponse.json(
        { error: "programId, communityId, and title are required" },
        { status: 400 }
      );
    }

    // Check if Gemini is available
    if (!isGeminiAvailable()) {
      return NextResponse.json(
        { error: "AI image generation is not configured" },
        { status: 503 }
      );
    }

    // Verify user has access to this community (is admin/owner)
    const supabase = await createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", userId)
      .eq("community_id", communityId)
      .single();

    if (!profile || profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can generate thumbnails" },
        { status: 403 }
      );
    }

    // Generate the image
    const imageBuffer = await generateProgramThumbnail(
      title,
      description || title,
      primaryColor || "#6366f1",
      accentColor || "#8b5cf6"
    );

    // Upload to Supabase storage
    const imageUrl = await uploadProgramImage(communityId, programId, imageBuffer);

    // Update the program with the new thumbnail
    const { error: updateError } = await supabase
      .from("programs")
      .update({ thumbnail_url: imageUrl })
      .eq("id", programId);

    if (updateError) {
      console.error("Failed to update program:", updateError);
      // Still return the URL even if update failed
    }

    return NextResponse.json({ 
      success: true, 
      thumbnailUrl: imageUrl,
      source: "gemini" 
    });

  } catch (error) {
    console.error(
      "AI thumbnail generation error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
}
