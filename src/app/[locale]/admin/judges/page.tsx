"use client";

import { useState, useEffect } from "react";
import { useTranslationForm } from "@/hooks/useTranslationForm";
import { useSession } from "next-auth/react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Region {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
}

interface Judge {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  iin: string | null;
  dob: string | null;
  category: string;
  categoryKk: string | null;
  categoryEn: string | null;
  regionId: number | null;
  region: Region | null;
  image: string | null;
  bio: string | null;
  certifications: string | null;
  isActive: boolean;
  sortOrder: number;
}

const JUDGE_CATEGORIES = [
  { id: "international", ru: "Международный", kk: "Халықаралық", en: "International" },
  { id: "national", ru: "Национальный", kk: "Ұлттық", en: "National" },
  { id: "first", ru: "Первая категория", kk: "Бірінші санат", en: "First Category" },
  { id: "second", ru: "Вторая категория", kk: "Екінші санат", en: "Second Category" },
  { id: "third", ru: "Третья категория", kk: "Үшінші санат", en: "Third Category" },
];

const defaultFormData = {
  name: "",
  nameKk: "",
  nameEn: "",
  iin: "",
  dob: "",
  category: "national",
  categoryKk: "",
  categoryEn: "",
  regionId: "",
  image: "",
  bio: "",
  certifications: "",
  isActive: true,
  sortOrder: 0,
};

const TRANSLATION_FIELDS = {
  name: { kk: "nameKk", en: "nameEn" },
  category: { kk: "categoryKk", en: "categoryEn" },
};

export default function AdminJudgesPage() {
  const locale = useLocale();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const userRegion = (session?.user as { region?: string })?.region;
  const isAdmin = userRole === 'Admin' || userRole === 'Editor';

  const [judges, setJudges] = useState<Judge[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const sortedJudges = sortOrder
    ? [...judges].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'ru');
        return sortOrder === 'asc' ? comparison : -comparison;
      })
    : judges;

  const toggleSort = () => {
    setSortOrder(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null);
  };

  const { formData, setFormData, handleTranslationBlur } = useTranslationForm(
    defaultFormData,
    TRANSLATION_FIELDS
  );
  const [saving, setSaving] = useState(false);

  const labels = {
    title: locale === "kk" ? "Төрешілер" : locale === "en" ? "Judges" : "Судьи",
    add: locale === "kk" ? "Қосу" : locale === "en" ? "Add" : "Добавить",
    edit: locale === "kk" ? "Өңдеу" : locale === "en" ? "Edit" : "Редактировать",
    delete: locale === "kk" ? "Жою" : locale === "en" ? "Delete" : "Удалить",
    save: locale === "kk" ? "Сақтау" : locale === "en" ? "Save" : "Сохранить",
    cancel: locale === "kk" ? "Болдырмау" : locale === "en" ? "Cancel" : "Отмена",
  };

  useEffect(() => {
    fetchJudges();
    fetchRegions();
  }, []);

  async function fetchJudges() {
    try {
      const res = await fetch("/api/judges?limit=100&admin=true");
      const data = await res.json();
      if (data.success) {
        setJudges(data.data);
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegions() {
    try {
      const res = await fetch("/api/regions?limit=100");
      const data = await res.json();
      if (data.success) {
        setRegions(data.data);
      }
    } catch {
      // silently fail
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(item: Judge) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      iin: item.iin || "",
      dob: item.dob || "",
      category: item.category,
      categoryKk: item.categoryKk || "",
      categoryEn: item.categoryEn || "",
      regionId: item.regionId?.toString() || "",
      image: item.image || "",
      bio: item.bio || "",
      certifications: item.certifications || "",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function getCategoryLabel(categoryId: string) {
    const cat = JUDGE_CATEGORIES.find(c => c.id === categoryId);
    if (!cat) return categoryId;
    return locale === "kk" ? cat.kk : locale === "en" ? cat.en : cat.ru;
  }

  async function handleSave() {
    if (!formData.name || !formData.category) {
      toast.error("Введите имя и категорию судьи");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/judges/${editingId}` : "/api/judges";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          regionId: formData.regionId || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Судья обновлен" : "Судья добавлен");
        setDialogOpen(false);
        fetchJudges();
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
      const res = await fetch(`/api/judges/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Судья удален");
        setDeleteDialogOpen(false);
        fetchJudges();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: Judge) {
    try {
      const res = await fetch(`/api/judges/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        fetchJudges();
      }
    } catch {
      // silently fail
    }
  }

  function getRegionName(region: Region | null) {
    if (!region) return "-";
    if (locale === "kk" && region.nameKk) return region.nameKk;
    if (locale === "en" && region.nameEn) return region.nameEn;
    return region.name;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{labels.title}</h1>
          {!isAdmin && userRegion && (
            <p className="text-muted-foreground">{userRegion}</p>
          )}
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {labels.add}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Фото</TableHead>
              <TableHead>
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  ФИО
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : sortOrder === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Регион</TableHead>
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
            ) : sortedJudges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              sortedJudges.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.image || undefined} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getCategoryLabel(item.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getRegionName(item.region)}</TableCell>
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
            <DialogTitle>{editingId ? labels.edit : labels.add}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>ФИО (рус) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleTranslationBlur("name")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>ФИО (каз)</Label>
                <Input
                  value={formData.nameKk}
                  onChange={(e) => setFormData({ ...formData, nameKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>ФИО (англ)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>ИИН</Label>
                <Input
                  value={formData.iin}
                  onChange={(e) => setFormData({ ...formData, iin: e.target.value })}
                  placeholder="123456789012"
                  maxLength={12}
                />
              </div>
              <div className="grid gap-2">
                <Label>Дата рождения</Label>
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Категория судьи *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {JUDGE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {locale === "kk" ? cat.kk : locale === "en" ? cat.en : cat.ru}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <div className="grid gap-2">
                <Label>Регион</Label>
                <Select
                  value={formData.regionId}
                  onValueChange={(v) => setFormData({ ...formData, regionId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите регион" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не указан</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {getRegionName(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Сертификаты/Лицензии</Label>
              <Input
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="World Archery Level 2, ..."
              />
            </div>

            <ImageUpload
              label="Фото судьи"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="judges"
            />

            <div className="grid gap-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Биография</Label>
              <Textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
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
              {labels.cancel}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "..." : labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этого судью? Это действие нельзя отменить.
            </DialogDescription>
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
