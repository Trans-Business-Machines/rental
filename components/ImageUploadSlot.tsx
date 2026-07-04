import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/lib/types/types";

interface ImageUploadSlotProps {
  label: string;
  image: ImageSlot;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function ImageUploadSlot({
  label,
  image,
  inputRef,
  disabled,
  onSelect,
  onRemove,
}: ImageUploadSlotProps) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1.5">
        {label}
      </p>

      {!image.preview ? (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
            "hover:border-primary/50 border-muted-foreground/25",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <Upload className="mx-auto size-6 text-muted-foreground mb-1" />
          <p className="text-xs font-medium">Click to upload</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            JPEG, PNG, WebP, AVIF (max 10MB)
          </p>
        </div>
      ) : (
        <div className="relative border rounded-lg p-2">
          <img
            src={image.preview}
            alt={`${label} ID preview`}
            className="w-full aspect-[4/2] object-fill rounded"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive cursor-pointer"
              onClick={onRemove}
              disabled={disabled}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onSelect}
        disabled={disabled}
      />
    </div>
  );
}
