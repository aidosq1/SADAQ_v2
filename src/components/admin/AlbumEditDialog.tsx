"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteGalleryItem, updateGalleryGroup } from "@/lib/actions/gallery";
import { Checkbox } from "@/components/ui/checkbox";

interface GalleryItem {
    id: number;
    url: string;
    title: string;
}

interface AlbumEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    album: {
        name: string;
        items: any[];
        eventDate: string | null;
        isPublished: boolean;
        cloudUrl?: string | null;
    } | null;
    onSuccess: () => void;
}

export function AlbumEditDialog({ isOpen, onClose, album, onSuccess }: AlbumEditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        albumName: "",
        title: "", // This will update the title of ALL items in album? Maybe just album name is enough?
        // User request was "one album", so probably they want to change the "Album Name" field primarily.
        // But usually title is also common. Let's allow editing both.
        eventDate: "",
        isPublished: true,
        cloudUrl: "",
    });
    const [albumItems, setAlbumItems] = useState<GalleryItem[]>([]);

    useEffect(() => {
        if (album) {
            setFormData({
                albumName: album.name || "",
                title: album.items[0]?.title || "", // Take title from first item
                eventDate: album.eventDate ? new Date(album.eventDate).toISOString().split('T')[0] : "",
                isPublished: album.isPublished,
                cloudUrl: album.cloudUrl || "",
            });
            setAlbumItems(album.items);
        }
    }, [album]);

    const handleSave = async () => {
        if (!album) return;
        setLoading(true);
        try {
            // Use local noon to avoid timezone day shift
            const result = await updateGalleryGroup(album.name, {
                albumName: formData.albumName,
                title: formData.title,
                eventDate: formData.eventDate ? new Date(formData.eventDate + "T12:00:00") : null,
                isPublished: formData.isPublished,
                cloudUrl: formData.cloudUrl || null,
            });

            if (result.success) {
                toast.success(result.message);
                onSuccess();
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Ошибка обновления");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        try {
            // Optimistic updatew
            setAlbumItems(prev => prev.filter(item => item.id !== id));

            const result = await deleteGalleryItem(id);
            if (!result.success) {
                toast.error("Ошибка удаления фото");
                // Revert? simpler to just fetch or ignore for now, this is admin panel
            }
        } catch (error) {
            toast.error("Ошибка удаления");
        }
    };

    if (!album) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Редактирование альбома</DialogTitle>
                    <DialogDescription>
                        Изменение данных альбома и управление фотографиями ({albumItems.length} шт.)
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 pr-2">
                    <div className="grid gap-4 mb-6 border-b pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Название альбома</Label>
                                <Input
                                    value={formData.albumName}
                                    onChange={(e) => setFormData({ ...formData, albumName: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Общее название фото</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Дата события</Label>
                                <Input
                                    type="date"
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-8">
                                <Checkbox
                                    id="album-published"
                                    checked={formData.isPublished}
                                    onCheckedChange={(c) => setFormData({ ...formData, isPublished: c as boolean })}
                                />
                                <Label htmlFor="album-published">Опубликован</Label>
                            </div>
                        </div>
                        <div className="grid gap-2 mt-4">
                            <Label>Ссылка на облако</Label>
                            <Input
                                placeholder="https://drive.google.com/drive/folders/..."
                                value={formData.cloudUrl}
                                onChange={(e) => setFormData({ ...formData, cloudUrl: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Ссылка на папку с дополнительными материалами (Google Drive, Яндекс.Диск)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Фотографии в альбоме</h4>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {albumItems.map((item) => (
                                <div key={item.id} className="relative aspect-square group border rounded-md overflow-hidden bg-muted">
                                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleDeleteItem(item.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
