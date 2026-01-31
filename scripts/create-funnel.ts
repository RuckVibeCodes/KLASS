import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://nwrtoqnllynmlfzfcgko.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const { data, error } = await supabase
    .from("funnels")
    .insert({
      community_id: "a958b4eb-b17b-43d8-8503-baf9e534ff89",
      title: "Shipped in a Weekend",
      slug: "shipped-in-a-weekend",
      description: "Learn to build and ship a complete app in just one weekend using AI-powered vibe coding",
      content_type: "program",
      content_id: "c1000000-0001-0001-0001-000000000001",
      price_cents: 0,
      headline: "Build & Ship Your First App This Weekend",
      subheadline: "No CS degree. No bootcamp. Just you, AI, and 48 hours to launch something real.",
      bullet_points: [
        "Step-by-step weekend sprint framework",
        "AI prompting techniques that actually work", 
        "Deploy to production with zero DevOps headaches",
        "Real examples from apps shipped in < 48 hours",
        "Access to the Vibe Code Crew community"
      ],
      cta_text: "Start Building Now",
      redirect_path: "/programs",
      welcome_message: "Welcome to Shipped in a Weekend! Check out the first module to get started.",
      published: true
    })
    .select()
    .single();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Created funnel:", data);
  }
}

main();
