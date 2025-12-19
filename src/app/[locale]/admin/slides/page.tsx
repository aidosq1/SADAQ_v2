"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Slide {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  description: string | null;
  descriptionKk: string | null;
  descriptionEn: string | null;
  image: string;
  imageClass: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const defaultFormData = {
  title: "",
  titleKk: "",
  titleEn: "",
  description: "",
  descriptionKk: "",
  descriptionEn: "",
  image: "",
  imageClass: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminSlidesPage() {
  const locale = useLocale();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    try {
      const res = await fetch("/api/slides");
      const data = await res.json();
      if (data.success) {
        setSlides(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch slides:", error);
      toast.error("Ошибка загрузки слайдов");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, sortOrder: slides.length });
    setDialogOpen(true);
  }

  function openEditDialog(item: Slide) {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      description: item.description || "",
      descriptionKk: item.descriptionKk || "",
      descriptionEn: item.descriptionEn || "",
      image: item.image,
      imageClass: item.imageClass || "",
      linkUrl: item.linkUrl || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.image.trim()) {
      toast.error("Заголовок и изображение обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/slides/${editingId}` : "/api/slides";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Слайд обновлён" : "Слайд создан");
        setDialogOpen(false);
        fetchSlides();
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/slides/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Слайд удалён");
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchSlides();
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: Slide) {
    try {
      const res = await fetch(`/api/slides/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(item.isActive ? "Слайд скрыт" : "Слайд активирован");
        fetchSlides();
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  }

  const title = locale === "kk" ? "Слайдер" : locale === "en" ? "Slides" : "Слайдер";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Порядок</TableHead>
              <TableHead className="w-[100px]">Превью</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Ссылка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : slides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              slides.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {item.sortOrder}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="w-20 h-12 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.linkUrl || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(item)}
                      className={item.isActive ? "text-green-600" : "text-gray-400"}
                    >
                      {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                        onClick={() => openDeleteDialog(item.id)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать слайд" : "Добавить слайд"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Заголовок (рус) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Заголовок (каз)</Label>
                <Input
                  value={formData.titleKk}
                  onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Заголовок (англ)</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Описание (рус)</Label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Описание (каз)</Label>
                <Textarea
                  rows={2}
                  value={formData.descriptionKk}
                  onChange={(e) => setFormData({ ...formData, descriptionKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Описание (англ)</Label>
                <Textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                />
              </div>
            </div>

            <ImageUpload
              label="Изображение слайда *"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="slides"
            />

            <div className="grid gap-2">
              <Label>CSS класс изображения</Label>
              <Input
                value={formData.imageClass}
                onChange={(e) => setFormData({ ...formData, imageClass: e.target.value })}
                placeholder="object-contain bg-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>URL ссылки</Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/media/news-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label>Порядок сортировки</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <Label htmlFor="isActive">Активен</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>Вы уверены, что хотите удалить этот слайд?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
