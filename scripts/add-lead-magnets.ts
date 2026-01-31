// Script to add lead magnets to VCC resources
// Run: npx tsx scripts/add-lead-magnets.ts

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const VCC_COMMUNITY_ID = "a958b4eb-b17b-43d8-8503-baf9e534ff89";

const leadMagnets = [
  {
    title: "Quick Start Guide",
    description: "Everything you need to get started with Claude Code. Perfect for beginners.",
    file: "Claude Code Starter Kit - Quick Start Guide.pdf",
  },
  {
    title: "10 App Ideas",
    description: "10 practical app ideas you can build this weekend with Claude Code.",
    file: "Claude Code Starter Kit - 10 App Ideas.pdf",
  },
  {
    title: "Prompt Templates",
    description: "Battle-tested prompt templates including the Architect, Debugger, and Reviewer agents.",
    file: "Claude Code Starter Kit - Prompt Templates.pdf",
  },
];

const LEAD_MAGNETS_PATH = "/Users/mattrucker/Library/Mobile Documents/com~apple~CloudDocs/Second Brain/Projects/Ruck Vibe Codes/lead-magnets";

async function main() {
  console.log("Adding lead magnets to VCC resources...\n");

  for (let i = 0; i < leadMagnets.length; i++) {
    const lm = leadMagnets[i];
    const filePath = path.join(LEAD_MAGNETS_PATH, lm.file);
    
    console.log(`[${i + 1}/${leadMagnets.length}] Processing: ${lm.title}`);

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    
    // Upload to storage
    const storagePath = `${VCC_COMMUNITY_ID}/resources/${Date.now()}-${lm.file.replace(/ /g, "-")}`;
    
    const { error: uploadError } = await supabase.storage
      .from("community-assets")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ❌ Upload failed:`, uploadError.message);
      continue;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("community-assets")
      .getPublicUrl(storagePath);

    console.log(`  ✓ Uploaded to: ${storagePath}`);

    // Create resource entry
    const { error: insertError } = await supabase
      .from("resources")
      .insert({
        community_id: VCC_COMMUNITY_ID,
        title: lm.title,
        description: lm.description,
        type: "file",
        url: publicUrl,
        file_size_bytes: fileSize,
        mime_type: "application/pdf",
        folder: "Lead Magnets",
        visibility: "public",
        order_index: i,
      });

    if (insertError) {
      console.error(`  ❌ Insert failed:`, insertError.message);
      continue;
    }

    console.log(`  ✓ Resource created: ${lm.title}\n`);
  }

  console.log("Done!");
}

main().catch(console.error);
