import { notFound } from "next/navigation";
import { getPublicFunnel, checkFunnelConversion } from "@/actions/funnels";
import { FunnelPage } from "@/components/funnels/funnel-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{
    "community-slug": string;
    "funnel-slug": string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const communitySlug = resolvedParams["community-slug"];
  const funnelSlug = resolvedParams["funnel-slug"];

  const result = await getPublicFunnel(communitySlug, funnelSlug);

  if (result.error || !result.data) {
    return {
      title: "Not Found",
    };
  }

  const { funnel, community } = result.data;

  return {
    title: funnel.headline || funnel.title,
    description: funnel.subheadline || funnel.description || `Join ${community.name}`,
    openGraph: {
      title: funnel.headline || funnel.title,
      description: funnel.subheadline || funnel.description || `Join ${community.name}`,
      images: funnel.cover_image_url ? [funnel.cover_image_url] : [],
    },
  };
}

export default async function PublicFunnelPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const communitySlug = resolvedParams["community-slug"];
  const funnelSlug = resolvedParams["funnel-slug"];

  const result = await getPublicFunnel(communitySlug, funnelSlug);

  if (result.error || !result.data) {
    notFound();
  }

  const { funnel, community } = result.data;

  // Check if user has already converted
  const conversionCheck = await checkFunnelConversion(funnel.id, community.id);
  const { hasConverted, hasProfile } = conversionCheck.data || { 
    hasConverted: false, 
    hasProfile: false 
  };

  // Get UTM source from search params
  const source = typeof resolvedSearchParams.utm_source === "string" 
    ? resolvedSearchParams.utm_source 
    : undefined;

  return (
    <FunnelPage
      funnel={funnel}
      community={community}
      hasConverted={hasConverted}
      hasProfile={hasProfile}
      source={source}
    />
  );
}
