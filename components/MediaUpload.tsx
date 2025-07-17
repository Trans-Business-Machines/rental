"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { useRef, useState } from "react";

interface MediaUploadProps {
  entityType: string;
  entityId: number;
  onUpload?: (media: any) => void;
}

export function MediaUpload({ entityType, entityId, onUpload }: MediaUploadProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    fetch(`/api/media?entityType=${entityType}&entityId=${entityId}`)
      .then(res => res.json())
      .then(setMedia);
  }, [entityType, entityId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setProgress(0);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", entityType);
      formData.append("entityId", entityId.toString());
      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/media");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          const newMedia = JSON.parse(xhr.responseText);
          setMedia((prev) => [newMedia, ...prev]);
          onUpload?.(newMedia);
          setProgress(0);
          resolve();
        };
        xhr.onerror = () => {
          setProgress(0);
          resolve();
        };
        xhr.send(formData);
      });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        tabIndex={0}
        aria-label="File upload dropzone"
        role="button"
        onClick={() => fileInputRef.current?.click()}
        style={{ cursor: uploading ? "not-allowed" : "pointer" }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          aria-label="Upload images"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading..." : "Drag & drop images here or click to select"}
          </span>
          {progress > 0 && uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
          )}
          <Button type="button" variant="outline" size="sm" disabled={uploading}>
            Select Images
          </Button>
        </div>
      </div>
      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
          {media.map((m) => (
            <div key={m.id} className="relative group rounded overflow-hidden border">
              <img
                src={m.url}
                alt="media preview"
                className="object-cover w-full h-24 sm:h-28 md:h-32 transition-transform group-hover:scale-105"
                draggable={false}
              />
              <button
                type="button"
                aria-label="Delete image"
                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(m.id);
                }}
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 