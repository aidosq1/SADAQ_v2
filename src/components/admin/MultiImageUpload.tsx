"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface UploadedFile {
    url: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
}

interface MultiImageUploadProps {
    onUploadComplete: (files: UploadedFile[]) => void;
    folder?: string;
    accept?: string;
    className?: string;
    maxFiles?: number;
}

export function MultiImageUpload({
    onUploadComplete,
    folder = "gallery",
    accept = "image/*",
    className,
    maxFiles = 50,
}: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [currentProgress, setCurrentProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = useCallback(async (files: File[]) => {
        if (!files.length) return;

        // Filter duplicates or limit check could go here
        if (uploadedFiles.length + files.length > maxFiles) {
            toast.error(`Максимум ${maxFiles} файлов`);
            return;
        }

        setUploading(true);
        setCurrentProgress(0);
        const newUploadedFiles: UploadedFile[] = [];
        let errors = 0;

        // Process files sequentially or in parallel batches? 
        // Parallel batches of 3 to avoid overwhelming browser/server
        const batchSize = 3;
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);

            await Promise.all(batch.map(async (file, index) => {
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
                        newUploadedFiles.push(data.data);
                    } else {
                        console.error(`Error uploading ${file.name}:`, data.error);
                        errors++;
                    }
                } catch (error) {
                    console.error(`Error uploading ${file.name}:`, error);
                    errors++;
                }
            }));

            // Update progress
            setCurrentProgress(Math.min(100, Math.round(((i + batch.length) / files.length) * 100)));
        }

        setUploadedFiles(prev => {
            const updated = [...prev, ...newUploadedFiles];
            onUploadComplete(updated); // Notify parent of all current files including new ones
            return updated;
        });

        setUploading(false);

        if (errors > 0) {
            toast.warning(`Загружено: ${newUploadedFiles.length}, Ошибок: ${errors}`);
        } else {
            toast.success(`Успешно загружено: ${newUploadedFiles.length}`);
        }

    }, [folder, maxFiles, onUploadComplete, uploadedFiles.length]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(Array.from(e.target.files));
        }
        // Reset input
        if (inputRef.current) inputRef.current.value = "";
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Filter images only if accept is image/*
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            if (files.length > 0) {
                handleUpload(files);
            } else {
                toast.error("Перетащите изображения");
            }
        }
    }

    function removeFile(index: number) {
        const newFiles = [...uploadedFiles];
        newFiles.splice(index, 1);
        setUploadedFiles(newFiles);
        onUploadComplete(newFiles);
    }

    function clearAll() {
        setUploadedFiles([]);
        onUploadComplete([]);
    }

    return (
        <div className={cn("grid gap-4", className)}>
            {/* Upload Zone */}
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-lg transition-colors cursor-pointer bg-muted/5",
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
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-sm font-medium">Загрузка... {currentProgress}%</p>
                    </div>
                ) : (
                    <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium text-muted-foreground text-center px-4">
                            Перетащите фотографии сюда или кликните для выбора
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Можно выбрать много файлов сразу (JPG, PNG, WebP)
                        </p>
                    </>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* File List/Grid */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Загружено файлов: {uploadedFiles.length}</h4>
                        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-destructive">
                            Очистить все
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {uploadedFiles.map((file, idx) => (
                            <div key={`${file.filename}-${idx}`} className="group relative aspect-square rounded-md border overflow-hidden bg-background">
                                <img
                                    src={file.url}
                                    alt={file.originalName}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />

                                <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="p-1 bg-black/50 hover:bg-destructive rounded-full cursor-pointer text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 truncate text-[10px] text-white text-center">
                                    {file.originalName}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
