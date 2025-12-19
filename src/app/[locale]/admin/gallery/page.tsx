"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Image, Video, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface GalleryItem {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  albumName: string | null;
  eventDate: string | null;
  isPublished: boolean;
}

const defaultFormData = {
  title: "",
  titleKk: "",
  titleEn: "",
  type: "photo",
  url: "",
  thumbnailUrl: "",
  albumName: "",
  eventDate: "",
  isPublished: true,
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/gallery?limit=100");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(item: GalleryItem) {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || "",
      albumName: item.albumName || "",
      eventDate: item.eventDate ? item.eventDate.split("T")[0] : "",
      isPublished: item.isPublished,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error("Название и URL обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/gallery/${editingId}` : "/api/gallery";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Элемент обновлён" : "Элемент добавлен");
        setDialogOpen(false);
        fetchItems();
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/gallery/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Элемент удалён");
        setDeleteDialogOpen(false);
        fetchItems();
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  async function togglePublished(item: GalleryItem) {
    try {
      await fetch(`/api/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      fetchItems();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Галерея</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Превью</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Альбом</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Нет данных</TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.type === "photo" ? (
                      <div
                        className="w-16 h-12 bg-cover bg-center rounded"
                        style={{ backgroundImage: `url(${item.thumbnailUrl || item.url})` }}
                      />
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    {item.type === "photo" ? (
                      <span className="flex items-center gap-1"><Image className="h-4 w-4" /> Фото</span>
                    ) : (
                      <span className="flex items-center gap-1"><Video className="h-4 w-4" /> Видео</span>
                    )}
                  </TableCell>
                  <TableCell>{item.albumName || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(item)}
                      className={item.isPublished ? "text-green-600" : "text-gray-400"}
                    >
                      {item.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => { setDeletingId(item.id); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить в галерею"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название (рус) *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (каз)</Label>
                <Input value={formData.titleKk} onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Название (англ)</Label>
                <Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Тип</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Фото</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ImageUpload
              label="Файл *"
              value={formData.url}
              onChange={(url) => setFormData({ ...formData, url })}
              folder="gallery"
            />

            <ImageUpload
              label="Превью (опционально)"
              value={formData.thumbnailUrl}
              onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
              folder="gallery"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Альбом</Label>
                <Input value={formData.albumName} onChange={(e) => setFormData({ ...formData, albumName: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Дата события</Label>
                <Input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="isPublished" checked={formData.isPublished} onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked as boolean })} />
              <Label htmlFor="isPublished">Опубликован</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "..." : "Сохранить"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>Вы уверены?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
