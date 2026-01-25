"use client";

import { useState } from "react";
import { Copy, Check, Link2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommunity } from "@/components/providers/community-provider";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const { community } = useCommunity();
  const [copied, setCopied] = useState(false);

  // Generate invite link (simple version - just the community URL)
  // In the future, this will include affiliate tracking codes
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/${community.slug}`
      : `/${community.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${community.name}`,
          text: `Check out ${community.name}!`,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Invite People
          </DialogTitle>
          <DialogDescription>
            Share this link to invite others to join {community.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite Link Input */}
          <div className="flex items-center gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1 text-white"
              style={{ backgroundColor: community.primary_color }}
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>

          {/* Future Affiliate Info Placeholder */}
          <p className="text-xs text-muted-foreground text-center">
            Affiliate tracking coming soon - earn commissions on referrals!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
