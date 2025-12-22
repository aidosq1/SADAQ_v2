"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileInfo?: (info: { type: string; size: number; name: string }) => void;
  label?: string;
  folder?: string;
  accept?: string;
  className?: string;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(url: string): string {
  const ext = url.split(".").pop()?.toUpperCase();
  return ext || "FILE";
}

export function FileUpload({
  value,
  onChange,
  onFileInfo,
  label = "Файл",
  folder = "documents",
  accept = ".pdf,.doc,.docx,.xls,.xlsx",
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file) return;

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
        setFileName(file.name);

        // Get file extension from mime type
        const ext = FILE_TYPE_LABELS[file.type] || file.name.split(".").pop()?.toLowerCase() || "file";

        if (onFileInfo) {
          onFileInfo({
            type: ext.toLowerCase(),
            size: file.size,
            name: file.name,
          });
        }

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
    setFileName("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>

      {/* File Preview */}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <div className="flex items-center justify-center w-12 h-12 rounded bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {fileName || value.split("/").pop()}
            </p>
            <p className="text-xs text-muted-foreground">
              {getFileExtension(value)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
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
            "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
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
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Перетащите файл или нажмите для выбора
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOC, DOCX, XLS, XLSX до 10MB
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
