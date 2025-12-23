"use client";

import { useState, useEffect } from "react";
import { useTranslationForm } from "@/hooks/useTranslationForm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface News {
  id: number;
  slug: string;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  content: string;
  contentKk: string | null;
  contentEn: string | null;
  excerpt: string | null;
  excerptKk: string | null;
  excerptEn: string | null;
  category: string;
  image: string | null;
  showInSlider: boolean;
  sliderOrder: number;
  publishedAt: string;
}

const defaultFormData = {
  title: "",
  titleKk: "",
  titleEn: "",
  content: "",
  contentKk: "",
  contentEn: "",
  excerpt: "",
  excerptKk: "",
  excerptEn: "",
  category: "Сборная",
  image: "",
  showInSlider: false,
  sliderOrder: 0,
  publishedAt: "",
};

const TRANSLATION_FIELDS = {
  title: { kk: "titleKk", en: "titleEn" },
  content: { kk: "contentKk", en: "contentEn" },
  excerpt: { kk: "excerptKk", en: "excerptEn" },
};

export default function AdminNewsPage() {
  const locale = useLocale();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { formData, setFormData, handleTranslationBlur } = useTranslationForm(
    defaultFormData,
    TRANSLATION_FIELDS
  );
  const [saving, setSaving] = useState(false);

  const labels = {
    title: locale === "kk" ? "Жаңалықтар" : locale === "en" ? "News" : "Новости",
    addNew: locale === "kk" ? "Жаңа қосу" : locale === "en" ? "Add New" : "Добавить",
    edit: locale === "kk" ? "Өңдеу" : locale === "en" ? "Edit" : "Редактировать",
    delete: locale === "kk" ? "Жою" : locale === "en" ? "Delete" : "Удалить",
    save: locale === "kk" ? "Сақтау" : locale === "en" ? "Save" : "Сохранить",
    cancel: locale === "kk" ? "Болдырмау" : locale === "en" ? "Cancel" : "Отмена",
    confirmDelete: locale === "kk" ? "Жоюды растау" : locale === "en" ? "Confirm Delete" : "Подтвердить удаление",
    deleteWarning: locale === "kk" ? "Бұл жаңалықты шынымен жойғыңыз келе ме?" : locale === "en" ? "Are you sure you want to delete this news?" : "Вы уверены, что хотите удалить эту новость?",
    titleRu: locale === "kk" ? "Тақырып (орысша)" : locale === "en" ? "Title (Russian)" : "Заголовок (рус)",
    titleKk: locale === "kk" ? "Тақырып (қазақша)" : locale === "en" ? "Title (Kazakh)" : "Заголовок (каз)",
    titleEn: locale === "kk" ? "Тақырып (ағылшынша)" : locale === "en" ? "Title (English)" : "Заголовок (англ)",
    contentRu: locale === "kk" ? "Мазмұны (орысша)" : locale === "en" ? "Content (Russian)" : "Содержание (рус)",
    contentKk: locale === "kk" ? "Мазмұны (қазақша)" : locale === "en" ? "Content (Kazakh)" : "Содержание (каз)",
    contentEn: locale === "kk" ? "Мазмұны (ағылшынша)" : locale === "en" ? "Content (English)" : "Содержание (англ)",
    excerpt: locale === "kk" ? "Қысқаша сипаттама" : locale === "en" ? "Excerpt" : "Краткое описание",
    category: locale === "kk" ? "Санат" : locale === "en" ? "Category" : "Категория",
    image: locale === "kk" ? "Сурет URL" : locale === "en" ? "Image URL" : "URL изображения",
    showInSlider: locale === "kk" ? "Слайдерде көрсету" : locale === "en" ? "Show in Slider" : "Показать в слайдере",
    sliderOrder: locale === "kk" ? "Слайдер реті" : locale === "en" ? "Slider Order" : "Порядок в слайдере",
    excerptKk: locale === "kk" ? "Қысқаша (қазақша)" : locale === "en" ? "Excerpt (Kazakh)" : "Краткое (каз)",
    excerptEn: locale === "kk" ? "Қысқаша (ағылшынша)" : locale === "en" ? "Excerpt (English)" : "Краткое (англ)",
    actions: locale === "kk" ? "Әрекеттер" : locale === "en" ? "Actions" : "Действия",
    date: locale === "kk" ? "Жарияланған күні" : locale === "en" ? "Publication Date" : "Дата публикации",
  };

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const res = await fetch("/api/news?limit=100");
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch {
      toast.error("Ошибка загрузки новостей");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(item: News) {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      content: item.content,
      contentKk: item.contentKk || "",
      contentEn: item.contentEn || "",
      excerpt: item.excerpt || "",
      excerptKk: item.excerptKk || "",
      excerptEn: item.excerptEn || "",
      category: item.category,
      image: item.image || "",
      showInSlider: item.showInSlider,
      sliderOrder: item.sliderOrder,
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().split('T')[0] : "",
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave(e?: React.MouseEvent) {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Заголовок обязателен");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/news/${editingId}` : "/api/news";
      const method = editingId ? "PATCH" : "POST";

      // Convert date string to ISO with local noon to avoid timezone day shift
      const dataToSend = {
        ...formData,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt + "T12:00:00").toISOString() : "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Новость обновлена" : "Новость создана");
        setDialogOpen(false);
        fetchNews();
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/news/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Новость удалена");
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchNews();
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{labels.title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {labels.addNew}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>{labels.titleRu}</TableHead>
              <TableHead>{labels.category}</TableHead>
              <TableHead className="w-[150px]">{labels.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      {item.showInSlider && (
                        <span className="text-xs text-amber-600">В слайдере</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
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
            <DialogTitle>
              {editingId ? labels.edit : labels.addNew}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{labels.titleRu} *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => handleTranslationBlur("title")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{labels.titleKk}</Label>
                <Input
                  value={formData.titleKk}
                  onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{labels.titleEn}</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{labels.contentRu}</Label>
              <Textarea
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onBlur={() => handleTranslationBlur("content")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{labels.contentKk}</Label>
                <Textarea
                  rows={3}
                  value={formData.contentKk}
                  onChange={(e) => setFormData({ ...formData, contentKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{labels.contentEn}</Label>
                <Textarea
                  rows={3}
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{labels.excerpt}</Label>
              <Textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                onBlur={() => handleTranslationBlur("excerpt")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{labels.category}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Сборная">Сборная</SelectItem>
                    <SelectItem value="Регионы">Регионы</SelectItem>
                    <SelectItem value="World Archery">World Archery</SelectItem>
                    <SelectItem value="Праздники">Праздники</SelectItem>
                    <SelectItem value="Другое">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ImageUpload
                label={labels.image}
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="news"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="showInSlider"
                checked={formData.showInSlider}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, showInSlider: checked as boolean })
                }
              />
              <Label htmlFor="showInSlider">{labels.showInSlider}</Label>
            </div>

            {formData.showInSlider && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{labels.sliderOrder}</Label>
                  <Input
                    type="number"
                    value={formData.sliderOrder}
                    onChange={(e) => setFormData({ ...formData, sliderOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            {formData.showInSlider && (
              <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {locale === "kk" ? "Слайдерде көрсетілетін мәтін (қысқаша сипаттама қолданылады)" :
                    locale === "en" ? "Text shown in slider (excerpt will be used)" :
                      "Текст в слайдере (используется краткое описание)"}
                </p>
                <div className="grid gap-2">
                  <Label>{labels.excerptKk}</Label>
                  <Textarea
                    rows={2}
                    value={formData.excerptKk}
                    onChange={(e) => setFormData({ ...formData, excerptKk: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{labels.excerptEn}</Label>
                  <Textarea
                    rows={2}
                    value={formData.excerptEn}
                    onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>{labels.date || "Дата публикации"}</Label>
              <Input
                type="date"
                value={formData.publishedAt || ""}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Если оставить пустым, будет использовано текущее время.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {labels.cancel}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "..." : labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{labels.confirmDelete}</DialogTitle>
            <DialogDescription>{labels.deleteWarning}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {labels.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {labels.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
