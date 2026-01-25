"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Loader2, Rocket } from "lucide-react";
import { provisionCommunity } from "@/actions/master-admin";
import { useToast } from "@/hooks/use-toast";
import type { PlanTier } from "@/lib/community-template";

export function NewCommunityForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    creatorClerkId: "",
    creatorEmail: "",
    plan: "standard" as PlanTier,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Community name is required",
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Community slug is required",
      });
      return;
    }

    if (!formData.creatorClerkId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Creator Clerk ID is required",
      });
      return;
    }

    if (!formData.creatorEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Creator email is required",
      });
      return;
    }

    startTransition(async () => {
      const result = await provisionCommunity(formData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Failed to create community",
          description: result.error,
        });
        return;
      }

      toast({
        variant: "success",
        title: "Community created",
        description: `${formData.name} has been provisioned successfully.`,
      });

      router.push(`/system-admin/communities/${result.data?.id}`);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Details</CardTitle>
        <CardDescription>
          Enter the details for the new community. The creator will be assigned
          as admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Community"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="my-awesome-community"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will be the URL path for the community
            </p>
          </div>

          {/* Creator Clerk ID */}
          <div className="space-y-2">
            <Label htmlFor="creatorClerkId">Creator Clerk User ID</Label>
            <Input
              id="creatorClerkId"
              value={formData.creatorClerkId}
              onChange={(e) =>
                setFormData({ ...formData, creatorClerkId: e.target.value })
              }
              placeholder="user_xxxxxxxxxxxxx"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Find this in Clerk Dashboard → Users
            </p>
          </div>

          {/* Creator Email */}
          <div className="space-y-2">
            <Label htmlFor="creatorEmail">Creator Email</Label>
            <Input
              id="creatorEmail"
              type="email"
              value={formData.creatorEmail}
              onChange={(e) =>
                setFormData({ ...formData, creatorEmail: e.target.value })
              }
              placeholder="creator@example.com"
            />
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <Label htmlFor="plan">Plan Tier</Label>
            <Select
              value={formData.plan}
              onValueChange={(value: PlanTier) =>
                setFormData({ ...formData, plan: value })
              }
            >
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  Standard - Basic features
                </SelectItem>
                <SelectItem value="premium">
                  Premium - All features enabled
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Premium includes: AI, Chat, Affiliates, Playbooks
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            Provision Community
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
