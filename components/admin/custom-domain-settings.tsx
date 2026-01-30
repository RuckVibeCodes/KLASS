"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDomainSettingsProps {
  communityId: string;
  initialDomain?: string | null;
  initialVerified?: boolean;
}

export function CustomDomainSettings({
  communityId,
  initialDomain,
  initialVerified,
}: CustomDomainSettingsProps) {
  const [domain, setDomain] = useState(initialDomain || "");
  const [savedDomain, setSavedDomain] = useState(initialDomain || "");
  const [isVerified, setIsVerified] = useState(initialVerified || false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const hasDomain = !!savedDomain;

  const handleSaveDomain = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          domain: domain.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save domain");
        return;
      }

      setSavedDomain(data.domain);
      setIsVerified(false);
      setSuccess("Domain saved. Please configure your DNS records.");
    } catch {
      setError("Failed to save domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setIsVerified(data.verified);
      if (data.verified) {
        setSuccess("Domain verified successfully!");
      } else {
        setError("DNS not configured correctly. Please check your records and try again.");
      }
    } catch {
      setError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this custom domain?")) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/domains", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to remove domain");
        return;
      }

      setSavedDomain("");
      setDomain("");
      setIsVerified(false);
      setSuccess("Domain removed");
    } catch {
      setError("Failed to remove domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Custom Domain
        </CardTitle>
        <CardDescription>
          Connect your own domain to make your community fully white-labeled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasDomain ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  placeholder="community.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleSaveDomain} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Domain"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the domain or subdomain you want to use (e.g., community.example.com)
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Domain Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{savedDomain}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Pending verification</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={`https://${savedDomain}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* DNS Configuration */}
            {!isVerified && (
              <div className="space-y-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
                <h4 className="font-medium text-sm">Configure DNS</h4>
                <p className="text-xs text-muted-foreground">
                  Add the following CNAME record to your domain&apos;s DNS settings:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-background border text-sm font-mono">
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Type:</span>
                        <span>CNAME</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{savedDomain.split(".")[0]}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground">Value:</span>
                        <span>cname.vercel-dns.com</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy("cname.vercel-dns.com")}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify DNS Configuration"
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
