"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, FolderOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { ResourceEditorDialog } from "@/components/admin/resource-editor-dialog";
import { ResourcesList } from "@/components/admin/resources-list";
import { getCommunityResources } from "@/actions/resources";
import type { Resource } from "@/types/database";

export default function AdminResourcesPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const router = useRouter();
  const [communitySlug, setCommunitySlug] = useState<string>("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    params.then((p) => {
      setCommunitySlug(p["community-slug"]);
    });
  }, [params]);

  useEffect(() => {
    if (!communitySlug) return;

    async function loadResources() {
      setLoading(true);
      const result = await getCommunityResources(communitySlug);
      if (result.data) {
        setResources(result.data as Resource[]);
      }
      setLoading(false);
    }
    loadResources();
  }, [communitySlug]);

  const handleCreate = () => {
    setEditingResource(null);
    setShowEditor(true);
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowEditor(true);
  };

  const handleSaved = async () => {
    setShowEditor(false);
    setEditingResource(null);
    // Reload resources
    const result = await getCommunityResources(communitySlug);
    if (result.data) {
      setResources(result.data as Resource[]);
    }
    router.refresh();
  };

  if (!communitySlug) return null;

  return (
    <div className="container py-6">
      <Link
        href={`/${communitySlug}/admin`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-muted-foreground">{resources.length} resources</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-4">
              Add links, files, and embeds to your resource vault
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ResourcesList
          resources={resources}
          communitySlug={communitySlug}
          onEdit={handleEdit}
        />
      )}

      <ResourceEditorDialog
        resource={editingResource}
        communitySlug={communitySlug}
        open={showEditor}
        onOpenChange={setShowEditor}
        onSaved={handleSaved}
      />
    </div>
  );
}
