"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Crown, Star, Loader2, UserX } from "lucide-react";
import { updateMemberRole, updateMemberTier, removeMember } from "@/actions/members";
import { useToast } from "@/hooks/use-toast";

interface MemberActionsProps {
  memberId: string;
  currentRole: string;
  currentTier: string;
  communitySlug: string;
}

export function MemberActions({
  memberId,
  currentRole,
  currentTier,
  communitySlug,
}: MemberActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRoleChange = (newRole: string) => {
    startTransition(async () => {
      try {
        await updateMemberRole(memberId, newRole, communitySlug);
        toast({
          variant: "success",
          title: newRole === "ADMIN" ? "Admin added" : "Admin removed",
          description: newRole === "ADMIN"
            ? "Member now has admin privileges"
            : "Member is now a regular member",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update role. Please try again.",
        });
      }
    });
  };

  const handleTierChange = (newTier: string) => {
    startTransition(async () => {
      try {
        await updateMemberTier(memberId, newTier, communitySlug);
        toast({
          variant: "success",
          title: newTier === "PAID" ? "Member upgraded" : "Member downgraded",
          description: newTier === "PAID"
            ? "Member now has Pro access"
            : "Member reverted to Free tier",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update tier. Please try again.",
        });
      }
    });
  };

  const handleRemove = () => {
    if (!confirm("Are you sure you want to remove this member? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      try {
        await removeMember(memberId, communitySlug);
        toast({
          variant: "success",
          title: "Member removed",
          description: "The member has been removed from the community.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove member. Please try again.",
        });
      }
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
        <DropdownMenuItem
          onClick={() =>
            handleRoleChange(currentRole === "ADMIN" ? "FREE_MEMBER" : "ADMIN")
          }
        >
          <Crown className="h-4 w-4 mr-2" />
          {currentRole === "ADMIN" ? "Remove Admin" : "Make Admin"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            handleTierChange(currentTier === "PAID" ? "FREE" : "PAID")
          }
        >
          <Star className="h-4 w-4 mr-2" />
          {currentTier === "PAID" ? "Downgrade to Free" : "Upgrade to Pro"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleRemove}
          className="text-destructive focus:text-destructive"
        >
          <UserX className="h-4 w-4 mr-2" />
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
