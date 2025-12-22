"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Изображение",
  folder = "images",
  accept = "image/*",
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/") && accept === "image/*") {
      toast.error("Только изображения");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.data.url);
        toast.success("Файл загружен");
      } else {
        toast.error(data.error || "Ошибка загрузки");
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  function handleClear() {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>

      {/* Preview */}
      {value && (
        <div className="relative w-full h-40 rounded-lg border overflow-hidden bg-muted">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Zone */}
      {!value && (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Перетащите файл или нажмите для выбора
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF, WebP до 10MB
              </p>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Manual URL input */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Или введите URL вручную"
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
