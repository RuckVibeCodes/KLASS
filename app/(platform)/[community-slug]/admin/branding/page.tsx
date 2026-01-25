import { redirect } from "next/navigation";

interface BrandingPageProps {
  params: Promise<{ "community-slug": string }>;
}

export default async function BrandingPage({ params }: BrandingPageProps) {
  const { "community-slug": communitySlug } = await params;
  redirect(`/${communitySlug}/admin/settings?tab=layout`);
}
