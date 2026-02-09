"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  GraduationCap,
  Users,
  MoreVertical,
  ExternalLink,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { deleteFunnel, updateFunnel } from "@/actions/funnels";
import type { Funnel } from "@/types/database";

interface FunnelsListProps {
  funnels: Funnel[];
  communitySlug: string;
}

export function FunnelsList({ funnels, communitySlug }: FunnelsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    await deleteFunnel(deletingId, communitySlug);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const handleTogglePublish = async (funnel: Funnel) => {
    await updateFunnel(funnel.id, communitySlug, {
      published: !funnel.published,
    });
  };

  const copyFunnelUrl = (funnel: Funnel) => {
    const url = `${window.location.origin}/${communitySlug}/${funnel.slug}`;
    navigator.clipboard.writeText(url);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "program":
        return <GraduationCap className="h-4 w-4" />;
      case "resource":
        return <FileText className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (funnels.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No funnels yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Create your first funnel to start capturing leads and growing your community.
          </p>
          <Link href={`/${communitySlug}/admin/funnels/new`}>
            <Button>Create Your First Funnel</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {funnels.map((funnel) => (
          <Card key={funnel.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {getContentIcon(funnel.content_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {funnel.title}
                      {!funnel.published && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      /{communitySlug}/{funnel.slug}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${communitySlug}/admin/funnels/${funnel.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyFunnelUrl(funnel)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    {funnel.published && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`/${communitySlug}/${funnel.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Live
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleTogglePublish(funnel)}>
                      {funnel.published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeletingId(funnel.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {funnel.price_cents > 0
                    ? `$${(funnel.price_cents / 100).toFixed(0)}`
                    : "Free"}
                </span>
                <span>•</span>
                <span>{funnel.signups_count} signups</span>
                <span>•</span>
                <span>{funnel.views_count} views</span>
                {funnel.signups_count > 0 && funnel.views_count > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {((funnel.signups_count / funnel.views_count) * 100).toFixed(1)}%
                      conversion
                    </span>
                  </>
                )}
              </div>
              {funnel.headline && (
                <p className="mt-2 text-sm line-clamp-1">{funnel.headline}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Funnel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this funnel? This action cannot be
              undone. All conversion data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
