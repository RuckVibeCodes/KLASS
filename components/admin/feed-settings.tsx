"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import {
  Hash,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  Sparkles,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Star,
  Zap,
  Heart,
  BookOpen,
  Megaphone,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/actions/categories";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/database";

interface FeedSettingsProps {
  community: Community;
  communitySlug: string;
}

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#6b7280", // Gray
];

const ICON_OPTIONS = [
  { value: "hash", icon: Hash, label: "Hash" },
  { value: "sparkles", icon: Sparkles, label: "Sparkles" },
  { value: "message", icon: MessageSquare, label: "Discussion" },
  { value: "lightbulb", icon: Lightbulb, label: "Ideas" },
  { value: "help", icon: HelpCircle, label: "Questions" },
  { value: "star", icon: Star, label: "Featured" },
  { value: "zap", icon: Zap, label: "Updates" },
  { value: "heart", icon: Heart, label: "Wins" },
  { value: "book", icon: BookOpen, label: "Resources" },
  { value: "megaphone", icon: Megaphone, label: "Announcements" },
];

function getIconComponent(iconName: string) {
  const found = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return found?.icon || Hash;
}

export function FeedSettings({ community, communitySlug }: FeedSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366f1",
    icon: "hash",
  });

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const result = await getCategories(communitySlug);
      if (result.data) {
        setCategories(result.data);
      }
      setIsLoading(false);
    }
    loadCategories();
  }, [communitySlug]);

  const resetForm = () => {
    setFormData({ name: "", color: "#6366f1", icon: "hash" });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setEditingCategory(category);
  };

  const handleSaveNew = () => {
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }

    startTransition(async () => {
      const result = await createCategory(communitySlug, formData);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      if (result.data) {
        setCategories([...categories, result.data]);
        toast({ variant: "success", title: "Topic created" });
        setShowAddDialog(false);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !formData.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }

    startTransition(async () => {
      const result = await updateCategory(communitySlug, editingCategory.id, formData);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      if (result.data) {
        setCategories(
          categories.map((c) => (c.id === editingCategory.id ? result.data! : c))
        );
        toast({ variant: "success", title: "Topic updated" });
        setEditingCategory(null);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!deletingCategory) return;

    startTransition(async () => {
      const result = await deleteCategory(communitySlug, deletingCategory.id);
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      setCategories(categories.filter((c) => c.id !== deletingCategory.id));
      toast({ variant: "success", title: "Topic deleted" });
      setDeletingCategory(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Feed Topics
          </CardTitle>
          <CardDescription>
            Create topics to help members categorize and filter posts in your community feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No topics yet. Create your first topic to help organize posts.</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent
                            className="h-4 w-4"
                            style={{ color: category.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">/{category.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCategory(category)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Topic Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Topic</DialogTitle>
            <DialogDescription>
              Create a new topic for your community feed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introductions, Questions, Wins"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform hover:scale-110",
                      formData.color === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 font-mono text-sm"
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setFormData({ ...formData, icon: value })}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                      formData.icon === value
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted"
                    )}
                    title={label}
                  >
                    <Icon className="h-5 w-5" style={{ color: formData.color }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                  }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(formData.icon);
                    return <IconComponent className="h-3.5 w-3.5" />;
                  })()}
                  {formData.name || "Topic Name"}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew} disabled={isPending || !formData.name.trim()}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Topic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Topic Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>
              Update the topic name, color, or icon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform hover:scale-110",
                      formData.color === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setFormData({ ...formData, icon: value })}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                      formData.icon === value
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-muted"
                    )}
                    title={label}
                  >
                    <Icon className="h-5 w-5" style={{ color: formData.color }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                  }}
                >
                  {(() => {
                    const IconComponent = getIconComponent(formData.icon);
                    return <IconComponent className="h-3.5 w-3.5" />;
                  })()}
                  {formData.name || "Topic Name"}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isPending || !formData.name.trim()}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;? Posts with this topic will have their topic removed, but the posts themselves will remain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
