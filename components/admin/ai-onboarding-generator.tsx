"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  MessageSquare,
  Mail,
  Send,
  RefreshCw,
} from "lucide-react";

interface AIOnboardingGeneratorProps {
  communitySlug: string;
}

interface GeneratedContent {
  welcomePost: string;
  firstDm: string;
  emailSubject: string;
  emailBody: string;
}

export function AIOnboardingGenerator({ communitySlug }: AIOnboardingGeneratorProps) {
  // Form state
  const [communityType, setCommunityType] = useState<string>("membership");
  const [communityDescription, setCommunityDescription] = useState("");
  const [tone, setTone] = useState<string>("friendly");
  const [primaryCTA, setPrimaryCTA] = useState("");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<GeneratedContent | null>(null);

  // Copy state
  const [copied, setCopied] = useState<string | null>(null);

  // Editable content state
  const [editedContent, setEditedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communitySlug,
          communityType,
          communityDescription,
          tone,
          primaryCTA,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      setContent(data);
      setEditedContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard failed
    }
  };

  const handleReset = () => {
    if (content) {
      setEditedContent(content);
    }
  };

  const currentContent = editedContent || content;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generate Onboarding Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Community Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Community Type</Label>
              <Select value={communityType} onValueChange={setCommunityType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Online Course</SelectItem>
                  <SelectItem value="membership">Membership Community</SelectItem>
                  <SelectItem value="coaching">Coaching Program</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="inspiring">Inspiring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Community Description</Label>
            <Textarea
              id="description"
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              placeholder="Briefly describe what your community is about..."
              rows={2}
            />
          </div>

          {/* Primary CTA */}
          <div className="space-y-2">
            <Label htmlFor="cta">Primary Call-to-Action</Label>
            <Input
              id="cta"
              value={primaryCTA}
              onChange={(e) => setPrimaryCTA(e.target.value)}
              placeholder="e.g., Start with our Getting Started program"
            />
            <p className="text-xs text-muted-foreground">
              What should new members do first?
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full md:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Drafts
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {currentContent && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Generated Drafts</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Edits
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                <Sparkles className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="welcome" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="welcome" className="gap-2">
                  <Send className="h-4 w-4" />
                  Welcome Post
                </TabsTrigger>
                <TabsTrigger value="dm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  First DM
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
              </TabsList>

              {/* Welcome Post */}
              <TabsContent value="welcome" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Welcome Post Draft</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(currentContent.welcomePost, "welcome")}
                    >
                      {copied === "welcome" ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={currentContent.welcomePost}
                    onChange={(e) =>
                      setEditedContent({ ...currentContent, welcomePost: e.target.value })
                    }
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Post this to your community feed to welcome new members.
                  </p>
                </div>
              </TabsContent>

              {/* First DM */}
              <TabsContent value="dm" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>First DM Template</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(currentContent.firstDm, "dm")}
                    >
                      {copied === "dm" ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={currentContent.firstDm}
                    onChange={(e) =>
                      setEditedContent({ ...currentContent, firstDm: e.target.value })
                    }
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Send this as a personal message to new members.
                  </p>
                </div>
              </TabsContent>

              {/* Email */}
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Email Subject</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(currentContent.emailSubject, "subject")}
                      >
                        {copied === "subject" ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Input
                      value={currentContent.emailSubject}
                      onChange={(e) =>
                        setEditedContent({ ...currentContent, emailSubject: e.target.value })
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Email Body</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(currentContent.emailBody, "body")}
                      >
                        {copied === "body" ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={currentContent.emailBody}
                      onChange={(e) =>
                        setEditedContent({ ...currentContent, emailBody: e.target.value })
                      }
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Copy this to your email platform (Mailchimp, ConvertKit, etc.)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
