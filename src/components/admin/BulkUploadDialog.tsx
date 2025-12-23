"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MultiImageUpload, UploadedFile } from "@/components/admin/MultiImageUpload";
import { createBulkGalleryItems } from "@/lib/actions/gallery";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface BulkUploadDialogProps {
    onSuccess: () => void;
}

export function BulkUploadDialog({ onSuccess }: BulkUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [metadata, setMetadata] = useState({
        title: "",
        albumName: "",
        eventDate: "",
    });

    const handleUploadComplete = (uploadedFiles: UploadedFile[]) => {
        setFiles(uploadedFiles);
    };

    const handleSave = async () => {
        if (files.length === 0) {
            toast.error("Загрузите хотя бы один файл");
            return;
        }

        setSaving(true);
        try {
            const items = files.map((file, index) => ({
                url: file.url,
                title: metadata.title || file.originalName, // Fallback to filename if title is empty
                type: "photo" as const,
                sortOrder: index,
            }));

            // Use local noon to avoid timezone day shift
            const result = await createBulkGalleryItems(items, {
                ...metadata,
                eventDate: metadata.eventDate ? new Date(metadata.eventDate + "T12:00:00") : null,
            });

            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                setFiles([]);
                setMetadata({ title: "", albumName: "", eventDate: "" });
                onSuccess();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Ошибка при сохранении");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Массовая загрузка
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Массовая загрузка фото</DialogTitle>
                    <DialogDescription>
                        Загрузите несколько фотографий и укажите общие данные.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
                        <div className="grid gap-2">
                            <Label>Общее название</Label>
                            <Input
                                placeholder="Чемпионат Азии 2025"
                                value={metadata.title}
                                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Применится ко всем фото</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Альбом</Label>
                            <Input
                                placeholder="Название альбома"
                                value={metadata.albumName}
                                onChange={(e) => setMetadata({ ...metadata, albumName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Дата события</Label>
                            <Input
                                type="date"
                                value={metadata.eventDate}
                                onChange={(e) => setMetadata({ ...metadata, eventDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Фотографии</Label>
                        <MultiImageUpload onUploadComplete={handleUploadComplete} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button onClick={handleSave} disabled={saving || files.length === 0}>
                        {saving ? "Сохранение..." : `Сохранить ${files.length > 0 ? `(${files.length})` : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
