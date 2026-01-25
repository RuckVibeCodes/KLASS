"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { updateProgram, deleteProgram } from "@/actions/programs";
import { useToast } from "@/hooks/use-toast";
import type { Program } from "@/types/database";

interface ProgramActionsProps {
  program: Program;
  communitySlug: string;
}

export function ProgramActions({ program, communitySlug }: ProgramActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleTogglePublish = () => {
    startTransition(async () => {
      const result = await updateProgram(program.id, communitySlug, {
        published: !program.published,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update program. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: program.published ? "Program unpublished" : "Program published",
        description: program.published
          ? "The program is now hidden from members."
          : "The program is now visible to members.",
      });
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this program? All lessons will also be deleted. This cannot be undone."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProgram(program.id, communitySlug);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete program. Please try again.",
        });
        return;
      }

      toast({
        variant: "success",
        title: "Program deleted",
        description: "The program and all its lessons have been deleted.",
      });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/${communitySlug}/admin/content/programs/${program.id}`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Program
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${communitySlug}/programs/${program.id}`} target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View as Member
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleTogglePublish}>
          {program.published ? (
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Program
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
