"use client";

import { useState, useEffect } from "react";
import { useTranslationForm } from "@/hooks/useTranslationForm";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
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
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Region {
  id: number;
  name: string;
}

interface Coach {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  iin: string | null;
  dob: string | null;
  regionId: number | null;
  region: Region | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
}

const defaultFormData = {
  name: "",
  nameKk: "",
  nameEn: "",
  iin: "",
  dob: "",
  regionId: "",
  image: "",
  isActive: true,
  sortOrder: 0,
};

const TRANSLATION_FIELDS = {
  name: { kk: "nameKk", en: "nameEn" },
};

export default function AdminCoachesPage() {
  const locale = useLocale();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const userRegion = (session?.user as { region?: string })?.region;
  const isAdmin = userRole === 'Admin' || userRole === 'Editor';

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const sortedCoaches = sortOrder
    ? [...coaches].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'ru');
        return sortOrder === 'asc' ? comparison : -comparison;
      })
    : coaches;

  const toggleSort = () => {
    setSortOrder(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null);
  };

  const { formData, setFormData, handleTranslationBlur } = useTranslationForm(
    defaultFormData,
    TRANSLATION_FIELDS
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoaches();
    fetchRegions();
  }, []);

  async function fetchCoaches() {
    try {
      const res = await fetch("/api/coaches?limit=100&admin=true");
      const data = await res.json();
      if (data.success) {
        setCoaches(data.data);
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

  function openEditDialog(item: Coach) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      iin: item.iin || "",
      dob: item.dob || "",
      regionId: item.regionId?.toString() || "",
      image: item.image || "",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name) {
      toast.error("Введите имя тренера");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/coaches/${editingId}` : "/api/coaches";
      const method = editingId ? "PATCH" : "POST";

      // Convert date string to ISO with local noon to avoid timezone day shift
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          regionId: formData.regionId || null,
          dob: formData.dob ? new Date(formData.dob + "T12:00:00").toISOString() : "",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Тренер обновлен" : "Тренер добавлен");
        setDialogOpen(false);
        fetchCoaches();
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
      const res = await fetch(`/api/coaches/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Тренер удален");
        setDeleteDialogOpen(false);
        fetchCoaches();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: Coach) {
    try {
      const res = await fetch(`/api/coaches/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        fetchCoaches();
      }
    } catch {
      // silently fail
    }
  }

  const title = locale === "kk" ? "Жаттықтырушылар" : locale === "en" ? "Coaches" : "Тренеры";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {!isAdmin && userRegion && (
            <p className="text-muted-foreground">{userRegion}</p>
          )}
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
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
              <TableHead>Регион</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedCoaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              sortedCoaches.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.image || undefined} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.region?.name || "-"}</TableCell>
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
            <DialogTitle>{editingId ? "Редактировать тренера" : "Добавить тренера"}</DialogTitle>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {isAdmin && (
              <div className="grid gap-2">
                <Label>Регион</Label>
                <Select
                  value={formData.regionId}
                  onValueChange={(v) => setFormData({ ...formData, regionId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите регион" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не указан</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <ImageUpload
              label="Фото тренера"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="coaches"
            />

            <div className="grid gap-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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
              Отмена
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
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
              Вы уверены, что хотите удалить этого тренера? Это действие нельзя отменить.
            </DialogDescription>
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
