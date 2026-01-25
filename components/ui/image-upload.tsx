"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage, deleteImage } from "@/actions/upload";
import type { BucketName } from "@/lib/supabase/storage";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket: BucketName;
  communityId: string;
  label?: string;
  description?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "banner";
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  communityId,
  label,
  description,
  className,
  aspectRatio = "square",
  accept = "image/*",
}: ImageUploadProps) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
  };

  const handleFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData, bucket, communityId);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        onChange(result.url);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (value) {
      startTransition(async () => {
        await deleteImage(bucket, value);
        onChange(null);
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          aspectClasses[aspectRatio],
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isPending && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm font-medium">
                  Click or drag to upload
                </span>
                <span className="text-xs">PNG, JPG, GIF, WebP up to 10MB</span>
              </>
            )}
          </button>
        )}

        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={isPending}
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
