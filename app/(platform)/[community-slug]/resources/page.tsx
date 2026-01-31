import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Link as LinkIcon,
  Download,
  Lock,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  FileArchive,
} from "lucide-react";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ "community-slug": string }>;
}) {
  const { userId } = await auth();
  const resolvedParams = await params;
  const supabase = await createAdminClient();

  // Get community
  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("slug", resolvedParams["community-slug"])
    .single();

  if (!community) return null;

  // Get user profile to check tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("community_id", community.id)
    .single();

  const canAccessPaid =
    profile?.tier === "PAID" || profile?.role === "ADMIN";

  // Get resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("community_id", community.id)
    .order("folder")
    .order("order_index");

  // Group by folder
  const folders = new Map<string, typeof resources>();
  resources?.forEach((resource) => {
    const folder = resource.folder || "root";
    if (!folders.has(folder)) {
      folders.set(folder, []);
    }
    folders.get(folder)!.push(resource);
  });

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Download templates, guides, and more
          </p>
        </div>
      </div>

      {resources && resources.length > 0 ? (
        <div className="space-y-8">
          {Array.from(folders.entries()).map(([folderName, folderResources]) => (
            <div key={folderName}>
              {folderName !== "root" && (
                <div className="flex items-center gap-2 mb-4">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{folderName}</h2>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {folderResources?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    canAccess={
                      resource.visibility !== "paid" || canAccessPaid
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground">
              Check back soon for downloadable content!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResourceCard({
  resource,
  canAccess,
}: {
  resource: any;
  canAccess: boolean;
}) {
  const isPaid = resource.visibility === "paid";

  return (
    <Card className={!canAccess ? "opacity-60" : ""}>
      {/* Thumbnail */}
      {resource.thumbnail_url && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={resource.thumbnail_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className={resource.thumbnail_url ? "p-4" : "p-4"}>
        <div className="flex items-start gap-3">
          {!resource.thumbnail_url && (
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              {getResourceIcon(resource)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {resource.thumbnail_url && (
                <div className="flex-shrink-0 h-6 w-6 rounded bg-muted flex items-center justify-center">
                  {getResourceIcon(resource)}
                </div>
              )}
              <h3 className="font-medium truncate">{resource.title}</h3>
              {isPaid && (
                <Badge variant="secondary" className="flex-shrink-0">
                  <Lock className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              )}
            </div>
            {resource.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {resource.description}
              </p>
            )}
            {resource.file_size_bytes && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(resource.file_size_bytes)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          {canAccess ? (
            resource.type === "link" ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full" size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
              </a>
            ) : (
              <div className="flex gap-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </a>
                <a
                  href={resource.url}
                  download
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            )
          ) : (
            <Button variant="outline" className="w-full" size="sm" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Upgrade to Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getResourceIcon(resource: any) {
  if (resource.type === "link") {
    return <LinkIcon className="h-5 w-5 text-muted-foreground" />;
  }

  const mimeType = resource.mime_type || "";

  if (mimeType.startsWith("image/")) {
    return <Image className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimeType.includes("pdf")) {
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("archive")) {
    return <FileArchive className="h-5 w-5 text-muted-foreground" />;
  }

  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
