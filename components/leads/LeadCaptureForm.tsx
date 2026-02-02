"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCaptureFormProps {
  source?: string;
  className?: string;
  showSocialProof?: boolean;
}

const CREATOR_TYPES = [
  { value: "courses", label: "Courses / Education" },
  { value: "coaching", label: "Coaching / Consulting" },
  { value: "content", label: "Content / Media" },
  { value: "community", label: "Community / Membership" },
  { value: "other", label: "Other" },
];

const PLATFORMS = [
  { value: "none", label: "None / Starting fresh" },
  { value: "skool", label: "Skool" },
  { value: "circle", label: "Circle" },
  { value: "teachable", label: "Teachable / Kajabi" },
  { value: "discord", label: "Discord / Slack" },
  { value: "other", label: "Other" },
];

const COMMUNITY_SIZES = [
  { value: "starting", label: "Just starting" },
  { value: "small", label: "1-50 members" },
  { value: "medium", label: "50-500 members" },
  { value: "large", label: "500+ members" },
];

export function LeadCaptureForm({
  source = "founders_page",
  className,
  showSocialProof = true,
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    creatorType: "",
    currentPlatform: "",
    communitySize: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const getUTMParams = () => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          creator_type: formData.creatorType,
          current_platform: formData.currentPlatform,
          community_size: formData.communitySize,
          source,
          landing_page: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          ...getUTMParams(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit form"
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "text-center p-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10",
          className
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto mb-4">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          You're on the list!
        </h3>
        <p className="text-zinc-400">
          Check your email for the Creator Community Launch Checklist.
        </p>
        <p className="text-sm text-zinc-500 mt-4">
          Plus: You'll be among the first to know when Founding Member spots
          open up.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-5 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50",
        className
      )}
    >
      {showSocialProof && (
        <div className="text-center mb-4">
          <p className="text-sm text-zinc-400">
            Join <span className="text-white font-semibold">2,847+ creators</span>{" "}
            on the waitlist
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-zinc-300">
          First name <span className="text-red-400">*</span>
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Your first name"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          required
          className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-300">
          Email <span className="text-red-400">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
          className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creatorType" className="text-zinc-300">
          What do you create? <span className="text-red-400">*</span>
        </Label>
        <Select
          value={formData.creatorType}
          onValueChange={(value) =>
            setFormData({ ...formData, creatorType: value })
          }
        >
          <SelectTrigger
            id="creatorType"
            className="bg-zinc-950/50 border-zinc-700 text-white"
          >
            <SelectValue placeholder="Select what you create" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            {CREATOR_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentPlatform" className="text-zinc-300">
          Current platform
        </Label>
        <Select
          value={formData.currentPlatform}
          onValueChange={(value) =>
            setFormData({ ...formData, currentPlatform: value })
          }
        >
          <SelectTrigger
            id="currentPlatform"
            className="bg-zinc-950/50 border-zinc-700 text-white"
          >
            <SelectValue placeholder="Select your current platform" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            {PLATFORMS.map((platform) => (
              <SelectItem key={platform.value} value={platform.value}>
                {platform.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="communitySize" className="text-zinc-300">
          Community size
        </Label>
        <Select
          value={formData.communitySize}
          onValueChange={(value) =>
            setFormData({ ...formData, communitySize: value })
          }
        >
          <SelectTrigger
            id="communitySize"
            className="bg-zinc-950/50 border-zinc-700 text-white"
          >
            <SelectValue placeholder="Select your community size" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
            {COMMUNITY_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "error" && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 h-11"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Get the Free Checklist
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-zinc-500 text-center">
        We respect your inbox. Unsubscribe anytime.
      </p>
    </form>
  );
}
