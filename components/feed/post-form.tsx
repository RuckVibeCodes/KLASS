"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createPost } from "@/actions/posts";
import {
  Loader2,
  Smile,
  X,
  Search,
  BarChart3,
  ChevronDown,
  Plus,
  Trash2,
  Image,
  Video,
  Link,
  Lock,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface Member {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface MembershipTier {
  id: string;
  name: string;
  slug: string;
  tier_level: number;
}

interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
}

interface PollOption {
  id: string;
  text: string;
}

interface PostFormProps {
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  communityId: string;
  communitySlug: string;
  members?: Member[];
  categories?: Category[];
  tiers?: MembershipTier[];
  isAdmin?: boolean;
}

export function PostForm({
  profile,
  communityId,
  communitySlug,
  members = [],
  categories = [],
  tiers = [],
  isAdmin = false,
}: PostFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Tier gating
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showTierPicker, setShowTierPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't collapse if focus is moving to another element within the form
    if (formContainerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Collapse if empty
    if (!content.trim() && !selectedGif && !showPollCreator && mediaUrls.length === 0) {
      setIsExpanded(false);
      setSelectedCategory(null);
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedGif(null);
    setSelectedCategory(null);
    setShowPollCreator(false);
    setPollQuestion("");
    setPollOptions([
      { id: "1", text: "" },
      { id: "2", text: "" },
    ]);
    setMediaUrls([]);
    setVideoUrl("");
    setShowVideoInput(false);
    setSelectedTier(null);
    setPreviewContent("");
    setShowTierPicker(false);
    setIsExpanded(false);
  };

  const handleSubmit = () => {
    const hasContent = content.trim() || selectedGif || mediaUrls.length > 0 || showPollCreator;
    if (!hasContent) return;

    const formData = new FormData();
    formData.append("communityId", communityId);
    formData.append("content", content);
    formData.append("communitySlug", communitySlug);
    formData.append("visibility", "members");

    // Combine GIF and uploaded media
    const allMedia = [...mediaUrls];
    if (selectedGif) {
      allMedia.push(selectedGif);
    }
    if (allMedia.length > 0) {
      formData.append("mediaUrls", JSON.stringify(allMedia));
    }

    if (selectedCategory) {
      formData.append("categoryId", selectedCategory.id);
    }

    if (showPollCreator && pollQuestion.trim()) {
      const validOptions = pollOptions.filter((o) => o.text.trim());
      if (validOptions.length >= 2) {
        formData.append("pollQuestion", pollQuestion);
        formData.append(
          "pollOptions",
          JSON.stringify(validOptions.map((o) => o.text))
        );
      }
    }

    // Tier gating
    if (selectedTier) {
      formData.append("minTierId", selectedTier.id);
      if (previewContent.trim()) {
        formData.append("previewContent", previewContent.trim());
      }
    }

    startTransition(async () => {
      try {
        await createPost(formData);
        resetForm();
      } catch (error) {
        console.error("Failed to create post:", error);
      }
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    setContent(value);
    setCursorPosition(position);

    const textBeforeCursor = value.slice(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionSearch(mentionMatch[1].toLowerCase());
    } else {
      setShowMentions(false);
      setMentionSearch("");
    }
  };

  const insertMention = useCallback(
    (member: Member) => {
      const textBeforeCursor = content.slice(0, cursorPosition);
      const textAfterCursor = content.slice(cursorPosition);
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

      if (mentionMatch) {
        const newTextBefore =
          textBeforeCursor.slice(0, mentionMatch.index) +
          `@${member.display_name?.replace(/\s+/g, "")} `;
        setContent(newTextBefore + textAfterCursor);
      }

      setShowMentions(false);
      setMentionSearch("");
      textareaRef.current?.focus();
    },
    [content, cursorPosition]
  );

  const handleEmojiSelect = (emoji: { native: string }) => {
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    setContent(textBeforeCursor + emoji.native + textAfterCursor);
    setCursorPosition(cursorPosition + emoji.native.length);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const searchGifs = async (query: string) => {
    setIsSearchingGifs(true);
    try {
      const endpoint = query.trim()
        ? `https://tenor.googleapis.com/v2/search?key=${TENOR_API_KEY}&q=${encodeURIComponent(query)}&limit=20&contentfilter=medium`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20&contentfilter=medium`;

      const response = await fetch(endpoint);
      const fetchedData = await response.json();

      const results: GifResult[] =
        fetchedData.results?.map(
          (gif: {
            id: string;
            media_formats: {
              gif: { url: string };
              tinygif: { url: string };
            };
            content_description: string;
          }) => ({
            id: gif.id,
            url: gif.media_formats.gif?.url || gif.media_formats.tinygif?.url,
            preview:
              gif.media_formats.tinygif?.url || gif.media_formats.gif?.url,
            title: gif.content_description,
          })
        ) || [];

      setGifResults(results);
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
      setGifResults([]);
    }
    setIsSearchingGifs(false);
  };

  const handleGifPickerOpen = (open: boolean) => {
    setShowGifPicker(open);
    if (open && gifResults.length === 0) {
      searchGifs("");
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([
        ...pollOptions,
        { id: Date.now().toString(), text: "" },
      ]);
    }
  };

  const removePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((o) => o.id !== id));
    }
  };

  const updatePollOption = (id: string, text: string) => {
    setPollOptions(pollOptions.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    // For now, we'll use FileReader to get base64 data URLs
    // In production, you'd upload to Supabase Storage
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newUrls.push(url);
      }
    }

    setMediaUrls([...mediaUrls, ...newUrls]);
    setIsUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addVideoUrl = () => {
    if (videoUrl.trim()) {
      // Convert YouTube/Vimeo URLs to embed format or use as-is
      let embedUrl = videoUrl.trim();

      // YouTube URL conversion
      const youtubeMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (youtubeMatch) {
        embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }

      // Vimeo URL conversion
      const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      setMediaUrls([...mediaUrls, embedUrl]);
      setVideoUrl("");
      setShowVideoInput(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const isVideoEmbed = (url: string) => {
    return url.includes('youtube.com/embed') || url.includes('player.vimeo.com');
  };

  const filteredMembers = members.filter(
    (m) =>
      m.display_name?.toLowerCase().includes(mentionSearch) &&
      m.id !== profile?.id
  );

  // Collapsed state - thin input bar
  if (!isExpanded) {
    return (
      <Card
        className="cursor-text hover:bg-accent/50 transition-colors"
        onClick={handleExpand}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-sm">
              {profile?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-sm flex-1">
            Write something...
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image className="h-4 w-4" />
            <Video className="h-4 w-4" />
            <span className="text-xs font-medium">GIF</span>
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
      </Card>
    );
  }

  // Expanded state - full post form
  return (
    <Card className="overflow-hidden" ref={formContainerRef}>
      <div className="p-4 space-y-4">
        {/* Header with avatar and category selector */}
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            {/* Category selector */}
            {categories.length > 0 && (
              <Popover
                open={showCategoryPicker}
                onOpenChange={setShowCategoryPicker}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border transition-colors",
                      selectedCategory
                        ? "border-transparent"
                        : "border-border hover:bg-muted"
                    )}
                    style={
                      selectedCategory
                        ? {
                            backgroundColor: `${selectedCategory.color}20`,
                            color: selectedCategory.color,
                          }
                        : undefined
                    }
                  >
                    {selectedCategory ? (
                      <>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        {selectedCategory.name}
                      </>
                    ) : (
                      <>Select topic</>
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" align="start">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}

            {/* Textarea */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Share something with the community..."
                className="min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
                value={content}
                onChange={handleTextareaChange}
                onBlur={handleBlur}
                disabled={isPending}
              />
              {/* Mentions dropdown */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                  {filteredMembers.slice(0, 5).map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => insertMention(member)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {member.display_name || "User"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Video URL input */}
        {showVideoInput && (
          <div className="ml-13 flex items-center gap-2">
            <Input
              placeholder="Paste YouTube, Vimeo, or video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addVideoUrl()}
              className="flex-1"
            />
            <Button size="sm" onClick={addVideoUrl} disabled={!videoUrl.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowVideoInput(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Media preview (uploaded images/videos) */}
        {mediaUrls.length > 0 && (
          <div className="ml-13 grid grid-cols-2 gap-2">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative">
                {isVideoEmbed(url) ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : url.startsWith('data:video') ? (
                  <video
                    src={url}
                    className="rounded-lg max-h-48 object-cover w-full"
                    controls
                  />
                ) : (
                  <img
                    src={url}
                    alt="Uploaded media"
                    className="rounded-lg max-h-48 object-cover w-full"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selected GIF preview */}
        {selectedGif && (
          <div className="relative inline-block ml-13">
            <img
              src={selectedGif}
              alt="Selected GIF"
              className="rounded-lg max-h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => setSelectedGif(null)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Poll Creator */}
        {showPollCreator && (
          <div className="ml-13 space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Create Poll</span>
              <button
                type="button"
                onClick={() => setShowPollCreator(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Input
              placeholder="Ask a question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="bg-background"
            />
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updatePollOption(option.id, e.target.value)}
                    className="bg-background"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePollOption(option.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={addPollOption}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add option
              </button>
            )}
          </div>
        )}

        {/* Tier Gating Preview */}
        {selectedTier && (
          <div className="ml-13 space-y-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                Restricted to {selectedTier.name} & above
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTier(null);
                  setPreviewContent("");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Preview text (shown to non-eligible members)
              </label>
              <Textarea
                placeholder="Write a teaser to encourage upgrades... (optional)"
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="bg-background min-h-[60px] text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
        <div className="flex items-center gap-1">
          {/* Image Upload */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Image className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          {/* Video Link */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", showVideoInput && "text-primary")}
            type="button"
            onClick={() => setShowVideoInput(!showVideoInput)}
          >
            <Video className="h-4 w-4" />
          </Button>

          {/* Emoji Picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                type="button"
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-none"
              side="top"
              align="start"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="auto"
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>

          {/* GIF Picker */}
          <Popover open={showGifPicker} onOpenChange={handleGifPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                type="button"
              >
                <span className="font-semibold text-xs">GIF</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top" align="start">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search GIFs..."
                    className="pl-9"
                    value={gifSearch}
                    onChange={(e) => {
                      setGifSearch(e.target.value);
                      searchGifs(e.target.value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {isSearchingGifs ? (
                    <div className="col-span-2 flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : gifResults.length > 0 ? (
                    gifResults.map((gif) => (
                      <button
                        key={gif.id}
                        type="button"
                        className="relative aspect-video overflow-hidden rounded-md hover:ring-2 hover:ring-primary"
                        onClick={() => {
                          setSelectedGif(gif.url);
                          setShowGifPicker(false);
                          setGifSearch("");
                        }}
                      >
                        <img
                          src={gif.preview}
                          alt={gif.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))
                  ) : (
                    <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
                      No GIFs found
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Powered by Tenor
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Poll Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", showPollCreator && "text-primary")}
            type="button"
            onClick={() => setShowPollCreator(!showPollCreator)}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>

          {/* Tier Lock Button (Admin only) */}
          {isAdmin && tiers.length > 0 && (
            <Popover open={showTierPicker} onOpenChange={setShowTierPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", selectedTier && "text-amber-500")}
                  type="button"
                >
                  <Lock className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                    Restrict to tier
                  </p>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                      !selectedTier && "bg-muted"
                    )}
                    onClick={() => {
                      setSelectedTier(null);
                      setPreviewContent("");
                      setShowTierPicker(false);
                    }}
                  >
                    <span>Everyone</span>
                    {!selectedTier && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  {tiers
                    .filter(t => t.tier_level > 0)
                    .sort((a, b) => a.tier_level - b.tier_level)
                    .map((tier) => (
                      <button
                        key={tier.id}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors",
                          selectedTier?.id === tier.id && "bg-muted"
                        )}
                        onClick={() => {
                          setSelectedTier(tier);
                          setShowTierPicker(false);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-amber-500" />
                          {tier.name} & above
                        </span>
                        {selectedTier?.id === tier.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetForm}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (!content.trim() &&
                !selectedGif &&
                mediaUrls.length === 0 &&
                !(
                  showPollCreator &&
                  pollQuestion.trim() &&
                  pollOptions.filter((o) => o.text.trim()).length >= 2
                ))
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
