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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { FileUpload } from "@/components/admin/FileUpload";
import { CATEGORIES, GENDERS, BOW_TYPES, getLocalizedLabel } from "@/lib/constants";
import { getTournamentStatus, getStatusLabel, getStatusClasses } from "@/lib/tournament-utils";

interface TournamentCategory {
  id?: number;
  category: string;
  gender: string;
  type: string;
}

interface Tournament {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  description: string | null;
  descriptionKk: string | null;
  descriptionEn: string | null;
  startDate: string;
  endDate: string;
  location: string;
  locationKk: string | null;
  locationEn: string | null;
  regulationUrl: string | null;
  isRegistrationOpen: boolean;
  registrationDeadline: string | null;
  isFeatured: boolean;
  categories: TournamentCategory[];
}

const defaultFormData = {
  title: "",
  titleKk: "",
  titleEn: "",
  description: "",
  descriptionKk: "",
  descriptionEn: "",
  startDate: "",
  endDate: "",
  location: "",
  locationKk: "",
  locationEn: "",
  regulationUrl: "",
  isRegistrationOpen: true,
  registrationDeadline: "",
  isFeatured: false,
  categories: [] as TournamentCategory[],
};

const TRANSLATION_FIELDS = {
  title: { kk: "titleKk", en: "titleEn" },
  description: { kk: "descriptionKk", en: "descriptionEn" },
  location: { kk: "locationKk", en: "locationEn" },
};

const defaultCategory: TournamentCategory = {
  category: "Adults",
  gender: "M",
  type: "Recurve",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  // Format for datetime-local input using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminTournamentsPage() {
  const locale = useLocale();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
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
  const [newCategory, setNewCategory] = useState<TournamentCategory>({ ...defaultCategory });

  useEffect(() => {
    fetchTournaments();
  }, []);

  async function fetchTournaments() {
    try {
      const res = await fetch("/api/tournaments?limit=100");
      const data = await res.json();
      if (data.success) {
        setTournaments(data.data);
      }
    } catch (error) {
      toast.error("Ошибка загрузки турниров");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData(defaultFormData);
    setNewCategory({ ...defaultCategory });
    setDialogOpen(true);
  }

  function openEditDialog(item: Tournament) {
    setEditingId(item.id);

    // If deadline has passed, registration should be closed
    const deadlinePassed = item.registrationDeadline
      ? new Date() > new Date(item.registrationDeadline)
      : false;

    setFormData({
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      description: item.description || "",
      descriptionKk: item.descriptionKk || "",
      descriptionEn: item.descriptionEn || "",
      startDate: formatDateForInput(item.startDate),
      endDate: formatDateForInput(item.endDate),
      location: item.location,
      locationKk: item.locationKk || "",
      locationEn: item.locationEn || "",
      regulationUrl: item.regulationUrl || "",
      isRegistrationOpen: deadlinePassed ? false : item.isRegistrationOpen,
      registrationDeadline: item.registrationDeadline ? formatDateForInput(item.registrationDeadline) : "",
      isFeatured: item.isFeatured,
      categories: item.categories || [],
    });
    setNewCategory({ ...defaultCategory });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function addCategory() {
    // Check for duplicate
    const exists = formData.categories.some(
      (c) => c.category === newCategory.category && c.gender === newCategory.gender && c.type === newCategory.type
    );
    if (exists) {
      toast.error("Такая категория уже добавлена");
      return;
    }
    setFormData({
      ...formData,
      categories: [...formData.categories, { ...newCategory }],
    });
    setNewCategory({ ...defaultCategory });
  }

  function removeCategory(index: number) {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    });
  }


  async function handleSave() {
    if (!formData.title.trim()) {
      toast.error("Название обязательно");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Даты начала и окончания обязательны");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Место проведения обязательно");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/tournaments/${editingId}` : "/api/tournaments";
      const method = editingId ? "PATCH" : "POST";

      // Convert datetime-local strings to ISO with timezone
      const dataToSend = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : "",
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : "",
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Турнир обновлён" : "Турнир создан");
        setDialogOpen(false);
        fetchTournaments();
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
      const res = await fetch(`/api/tournaments/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Турнир удалён");
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchTournaments();
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleRegistration(item: Tournament) {
    try {
      const res = await fetch(`/api/tournaments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRegistrationOpen: !item.isRegistrationOpen }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(item.isRegistrationOpen ? "Регистрация закрыта" : "Регистрация открыта");
        fetchTournaments();
      }
    } catch (error) {
      toast.error("Ошибка обновления");
    }
  }

  async function toggleFeatured(item: Tournament) {
    try {
      const res = await fetch(`/api/tournaments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(item.isFeatured ? "Убран с главной" : "Показан на главной");
        fetchTournaments();
      }
    } catch (error) {
      toast.error("Ошибка обновления");
    }
  }

  const getCategoryLabel = (cat: TournamentCategory) => {
    const categoryItem = CATEGORIES.find((c) => c.id === cat.category);
    const genderItem = GENDERS.find((g) => g.id === cat.gender);
    const typeItem = BOW_TYPES.find((t) => t.id === cat.type);

    return `${getLocalizedLabel(categoryItem!, locale)} ${getLocalizedLabel(genderItem!, locale)} - ${getLocalizedLabel(typeItem!, locale)}`;
  };

  const title = locale === "kk" ? "Турнирлер" : locale === "en" ? "Tournaments" : "Турниры";

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
              <TableHead>Название</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Даты</TableHead>
              <TableHead>Место</TableHead>
              <TableHead>Категории</TableHead>
              <TableHead>Регистрация</TableHead>
              <TableHead>На главной</TableHead>
              <TableHead className="w-[120px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Нет турниров
                </TableCell>
              </TableRow>
            ) : (
              tournaments.map((item) => {
                const status = getTournamentStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{item.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusClasses(status)} text-xs`}>
                        {getStatusLabel(status, locale)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-4 w-4" />
                        {formatDate(item.startDate)} — {formatDate(item.endDate)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate">{item.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.categories?.length > 0 ? (
                          item.categories.slice(0, 3).map((cat, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cat.category} {cat.gender} {cat.type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                        {item.categories?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.categories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRegistration(item)}
                        className={item.isRegistrationOpen ? "text-green-600" : "text-gray-400"}
                      >
                        {item.isRegistrationOpen ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(item)}
                        className={item.isFeatured ? "text-yellow-500" : "text-gray-400"}
                      >
                        {item.isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать турнир" : "Добавить турнир"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label>Название (рус) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={() => handleTranslationBlur("title")}
                placeholder="Чемпионат Республики Казахстан 2025"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (каз)</Label>
                <Input
                  value={formData.titleKk}
                  onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Название (англ)</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Описание (рус)</Label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={() => handleTranslationBlur("description")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Дата начала * <span className="text-muted-foreground font-normal">(время Астаны)</span></Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Дата окончания * <span className="text-muted-foreground font-normal">(время Астаны)</span></Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label>Место проведения (рус) *</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onBlur={() => handleTranslationBlur("location")}
                placeholder="Алматы, Трамплины"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Место проведения (каз)</Label>
                <Input
                  value={formData.locationKk}
                  onChange={(e) => setFormData({ ...formData, locationKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Место проведения (англ)</Label>
                <Input
                  value={formData.locationEn}
                  onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                />
              </div>
            </div>

            {/* Regulation */}
            <div className="grid gap-2">
              <FileUpload
                value={formData.regulationUrl}
                onChange={(url) => setFormData({ ...formData, regulationUrl: url })}
                accept=".pdf,.doc,.docx"
                label="Регламент (положение)"
              />
            </div>

            {/* Categories Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <Label className="text-base font-semibold">Категории турнира</Label>

              {/* Add new category */}
              <div className="flex flex-wrap gap-2 items-end">
                <div className="grid gap-1">
                  <Label className="text-xs">Возраст</Label>
                  <Select
                    value={newCategory.category}
                    onValueChange={(v) => setNewCategory({ ...newCategory, category: v })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getLocalizedLabel(cat, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label className="text-xs">Пол</Label>
                  <Select
                    value={newCategory.gender}
                    onValueChange={(v) => setNewCategory({ ...newCategory, gender: v })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {getLocalizedLabel(g, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label className="text-xs">Тип лука</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(v) => setNewCategory({ ...newCategory, type: v })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOW_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {getLocalizedLabel(t, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Добавить
                </Button>
              </div>

              {/* List of added categories */}
              {formData.categories.length > 0 && (
                <div className="space-y-2">
                  {formData.categories.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Badge variant="secondary">
                        {getCategoryLabel(cat)}
                      </Badge>
                      <div className="flex-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeCategory(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.categories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Добавьте категории для турнира (возраст + пол + тип лука)
                </p>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="grid gap-2">
              <Label>Дедлайн регистрации <span className="text-muted-foreground font-normal">(время Астаны, опционально)</span></Label>
              <Input
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Если установлен, регистрация автоматически закроется после этой даты
              </p>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isRegistrationOpen"
                  checked={formData.isRegistrationOpen}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRegistrationOpen: checked as boolean })}
                  disabled={formData.registrationDeadline ? new Date() > new Date(formData.registrationDeadline) : false}
                />
                <Label htmlFor="isRegistrationOpen" className={formData.registrationDeadline && new Date() > new Date(formData.registrationDeadline) ? "text-muted-foreground" : ""}>
                  Регистрация открыта
                  {formData.registrationDeadline && new Date() > new Date(formData.registrationDeadline) && (
                    <span className="text-xs ml-2 text-destructive">(дедлайн прошёл)</span>
                  )}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                />
                <Label htmlFor="isFeatured">Показывать на главной</Label>
              </div>
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
            <DialogDescription>
              Вы уверены, что хотите удалить этот турнир? Все связанные категории, регистрации и результаты также будут удалены.
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
