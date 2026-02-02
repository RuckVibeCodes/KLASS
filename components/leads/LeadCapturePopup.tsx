"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCapturePopupProps {
  source?: string;
  delayMs?: number;
  className?: string;
}

export function LeadCapturePopup({
  source = "popup",
  delayMs = 1000,
  className,
}: LeadCapturePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem("klass-popup-dismissed");
    if (dismissed) {
      setHasDismissed(true);
    }
  }, []);

  // Exit intent handler
  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasDismissed && !isVisible) {
        setIsVisible(true);
      }
    },
    [hasDismissed, status, isVisible]
  );

  useEffect(() => {
    if (hasDismissed || status === "success") return;

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasDismissed, status, delayMs, handleMouseLeave]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("klass-popup-dismissed", "true");
    setHasDismissed(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          landing_page: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setStatus("success");
      setTimeout(() => {
        handleDismiss();
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  if (!isVisible || hasDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div
        className={cn(
          "relative w-full max-w-md mx-4 p-6 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl",
          "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300",
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto mb-4">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
            <p className="text-zinc-400">Check your email for your free resource.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm text-amber-300 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Wait! Before you go...
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Get the Creator Community Launch Checklist
              </h3>
              <p className="text-sm text-zinc-400">
                50-point checklist to launch your paid community the right way.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-zinc-950/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
                />
              </div>

              {status === "error" && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  Something went wrong. Please try again.
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
                    Sending...
                  </>
                ) : (
                  "Send Me the Checklist"
                )}
              </Button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                No thanks, I'll figure it out myself
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
