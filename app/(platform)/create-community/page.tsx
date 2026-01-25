"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateCommunityPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Create community
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          primary_color: "#000000",
          accent_color: "#6366f1",
          settings_json: {},
        })
        .select()
        .single();

      if (communityError) {
        if (communityError.code === "23505") {
          setError("This community slug is already taken. Try a different name.");
        } else {
          setError(communityError.message);
        }
        return;
      }

      // Create profile as admin
      const { error: profileError } = await supabase.from("profiles").insert({
        clerk_user_id: userId,
        community_id: community.id,
        role: "ADMIN",
        tier: "PAID",
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      // Create default modules
      const defaultModules = [
        { key: "feed", label: "Community", enabled: true, order_index: 0 },
        { key: "programs", label: "Programs", enabled: true, order_index: 1 },
        { key: "resources", label: "Resources", enabled: true, order_index: 2 },
        { key: "events", label: "Events", enabled: true, order_index: 3 },
        { key: "members", label: "Members", enabled: true, order_index: 4 },
      ];

      await supabase.from("community_modules").insert(
        defaultModules.map((module) => ({
          ...module,
          community_id: community.id,
        }))
      );

      // Redirect to new community
      router.push(`/${community.slug}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50 py-12">
      <div className="container max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create Your Community</CardTitle>
            <CardDescription>
              Set up your community and start building your audience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="My Awesome Community"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    klass.app/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="my-community"
                    required
                    pattern="[a-z0-9-]+"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell people what your community is about..."
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Community
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
