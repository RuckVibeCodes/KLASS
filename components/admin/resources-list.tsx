"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Plus,
  Lock,
  FileText,
  Link as LinkIcon,
  Pencil,
  Crown,
} from "lucide-react";
import { ResourceEditorDialog } from "./resource-editor-dialog";
import type { Resource, ContentTierRequirement } from "@/types/database";

interface ResourceWithTier extends Resource {
  content_tier_requirements?: ContentTierRequirement[];
}

interface ResourcesListProps {
  resources: ResourceWithTier[];
  communitySlug: string;
}

export function ResourcesList({ resources: initialResources, communitySlug }: ResourcesListProps) {
  const [resources] = useState<ResourceWithTier[]>(initialResources);
  const [selectedResource, setSelectedResource] = useState<ResourceWithTier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEditResource = (resource: ResourceWithTier) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  // Group resources by folder
  const groupedResources = resources.reduce((acc, resource) => {
    const folder = resource.folder || "Root";
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(resource);
    return acc;
  }, {} as Record<string, ResourceWithTier[]>);

  const folders = Object.keys(groupedResources).sort((a, b) => {
    if (a === "Root") return -1;
    if (b === "Root") return 1;
    return a.localeCompare(b);
  });

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
          <p className="text-muted-foreground mb-4">
            Add files and links for your members to download
          </p>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {folders.map((folder) => (
          <div key={folder}>
            {folders.length > 1 && (
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {folder}
              </h3>
            )}
            <div className="space-y-2">
              {groupedResources[folder].map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          {resource.type === "link" ? (
                            <LinkIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{resource.title}</p>
                            {resource.visibility === "paid" && (
                              <Badge variant="secondary">
                                <Lock className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                            {resource.content_tier_requirements && resource.content_tier_requirements.length > 0 && (
                              <Badge variant="outline" className="gap-1">
                                <Crown className="h-3 w-3" />
                                Tier Gated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {resource.type === "link" ? "Link" : "File"}
                            {resource.description && ` • ${resource.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResource(resource)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            Open
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ResourceEditorDialog
        resource={selectedResource}
        communitySlug={communitySlug}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </>
  );
}
