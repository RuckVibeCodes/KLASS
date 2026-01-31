"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { processFunnelSignup } from "@/actions/funnels";
import type { Funnel, Community } from "@/types/database";

/**
 * Convert video URLs to embed URLs
 */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // YouTube - various formats
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) {
    return `https://www.loom.com/embed/${loomMatch[1]}`;
  }

  // If it's already an embed URL, return as-is
  if (url.includes("/embed/") || url.includes("player.vimeo.com")) {
    return url;
  }

  return null;
}

interface FunnelPageProps {
  funnel: Funnel;
  community: Community;
  hasConverted: boolean;
  hasProfile: boolean;
  source?: string;
}

export function FunnelPage({
  funnel,
  community,
  hasConverted,
  hasProfile,
  source,
}: FunnelPageProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccessContent = async () => {
    if (!isSignedIn) {
      // This shouldn't happen as the button is wrapped in SignInButton for unsigned users
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processFunnelSignup(funnel.id, source);

      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.data) {
        const { redirectPath, communitySlug } = result.data;
        // Redirect to the community with the redirect path
        router.push(`/${communitySlug}${redirectPath}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const bulletPoints = funnel.bullet_points || [];
  const isPaid = funnel.price_cents > 0;
  const priceDisplay = isPaid
    ? `$${(funnel.price_cents / 100).toFixed(funnel.price_cents % 100 === 0 ? 0 : 2)}`
    : "Free";

  // Determine button state and action
  const renderCTA = () => {
    if (!isLoaded) {
      return (
        <Button size="lg" className="w-full text-lg py-6" disabled>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    // Already converted - show "Access Content" button
    if (hasConverted) {
      return (
        <Button
          size="lg"
          className="w-full text-lg py-6"
          onClick={() => router.push(`/${community.slug}${funnel.redirect_path || "/feed"}`)}
        >
          Access Content
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      );
    }

    // Not signed in - show sign up button
    if (!isSignedIn) {
      const callbackUrl = `/${community.slug}/${funnel.slug}?action=signup${source ? `&utm_source=${source}` : ""}`;
      
      return (
        <SignInButton mode="modal" forceRedirectUrl={callbackUrl}>
          <Button
            size="lg"
            className="w-full text-lg py-6"
            style={{
              backgroundColor: community.primary_color,
            }}
          >
            {funnel.cta_text || "Get Free Access"}
            {isPaid && <span className="ml-2">- {priceDisplay}</span>}
          </Button>
        </SignInButton>
      );
    }

    // Signed in but hasn't converted yet - show access button
    return (
      <Button
        size="lg"
        className="w-full text-lg py-6"
        onClick={handleAccessContent}
        disabled={isProcessing || isPaid}
        style={{
          backgroundColor: community.primary_color,
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : isPaid ? (
          "Paid funnels coming soon"
        ) : (
          funnel.cta_text || "Get Free Access"
        )}
      </Button>
    );
  };

  const embedUrl = funnel.video_url ? getEmbedUrl(funnel.video_url) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Cover Image (only if no video) */}
      {funnel.cover_image_url && !embedUrl && (
        <div className="w-full h-64 md:h-80 relative">
          <img
            src={funnel.cover_image_url}
            alt={funnel.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      {/* Video Section */}
      {embedUrl && (
        <div className="w-full bg-black">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Community Badge */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={community.logo_url || undefined} />
            <AvatarFallback
              className="text-white font-bold"
              style={{ backgroundColor: community.primary_color }}
            >
              {community.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground font-medium">
            {community.name}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          {funnel.headline || funnel.title}
        </h1>

        {/* Subheadline */}
        {funnel.subheadline && (
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {funnel.subheadline}
          </p>
        )}

        {/* Bullet Points */}
        {bulletPoints.length > 0 && (
          <div className="space-y-3 mb-8">
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: community.primary_color }}
                >
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        {funnel.description && !funnel.subheadline && (
          <p className="text-muted-foreground mb-8">{funnel.description}</p>
        )}

        {/* CTA Section */}
        <div className="space-y-4">
          {renderCTA()}

          {error && (
            <p className="text-destructive text-center text-sm">{error}</p>
          )}

          {/* Terms notice */}
          {!hasConverted && (
            <p className="text-center text-sm text-muted-foreground">
              By signing up, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>
            </p>
          )}
        </div>

        {/* Spacer */}
        <div className="h-16" />

        {/* Footer */}
        <footer className="border-t pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href="https://klasscommunity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-foreground inline-flex items-center gap-1"
            >
              KLASS
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
