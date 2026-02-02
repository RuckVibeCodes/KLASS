"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCaptureInlineProps {
  source?: string;
  className?: string;
  layout?: "vertical" | "horizontal";
  showLabels?: boolean;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export function LeadCaptureInline({
  source = "inline",
  className,
  layout = "vertical",
  showLabels = true,
  placeholder = "Enter your email",
  buttonText = "Join the waitlist",
  successMessage = "You're on the list!",
}: LeadCaptureInlineProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: name || undefined,
          source,
          landing_page: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10",
          className
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
          <Check className="h-4 w-4" />
        </div>
        <span className="text-emerald-400 font-medium">{successMessage}</span>
      </div>
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className={cn("gap-3", layout === "horizontal" ? "flex" : "space-y-3")}>
      {layout === "horizontal" && (
        <>
          <div className="flex-1 space-y-1">
            {showLabels && (
              <Label htmlFor={`inline-email-${source}`} className="sr-only">
                Email
              </Label>
            )}
            <Input
              id={`inline-email-${source}`}
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 h-10"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </>
      )}

      {layout === "vertical" && (
        <>
          <div className="space-y-1">
            {showLabels && (
              <Label htmlFor={`inline-name-${source}`} className="text-zinc-300">
                Name (optional)
              </Label>
            )}
            <Input
              id={`inline-name-${source}`}
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
            />
          </div>
          <div className="space-y-1">
            {showLabels && (
              <Label htmlFor={`inline-email-${source}`} className="text-zinc-300">
                Email
              </Label>
            )}
            <Input
              id={`inline-email-${source}`}
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
            />
          </div>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 h-10"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                {buttonText}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </>
      )}
    </form>
  );

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-zinc-800 bg-zinc-900/50",
        className
      )}
    >
      {content}
    </div>
  );
}
