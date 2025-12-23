"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  MapPin,
  Users,
  Trophy,
  Activity,
  BarChart3,
  Clock,
  UserCog,
  Calendar,
  Medal,
  Target,
  ScrollText,
  Languages,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

// ==================== HELPERS ====================

function createTranslationBlurHandler<T extends Record<string, unknown>>(
  formData: T,
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  ruField: keyof T,
  kkField: keyof T,
  enField: keyof T
) {
  return () => {
    const ruValue = formData[ruField] as string;
    if (!ruValue) return;

    setFormData(prev => {
      const updates: Partial<T> = {};
      const kkValue = prev[kkField] as string;
      const enValue = prev[enField] as string;

      if (!kkValue?.trim()) updates[kkField] = ruValue as T[keyof T];
      if (!enValue?.trim()) updates[enField] = ruValue as T[keyof T];

      return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  };
}

// ==================== INTERFACES ====================

interface SiteStat {
  id: number;
  key: string;
  value: string;
  label: string;
  labelKk: string | null;
  labelEn: string | null;
  iconType: string;
  sortOrder: number;
  isActive: boolean;
}

interface HistoryEvent {
  id: number;
  year: string;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  description: string;
  descriptionKk: string | null;
  descriptionEn: string | null;
  iconType: string;
  sortOrder: number;
  isActive: boolean;
}

interface Staff {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  role: string;
  roleTitle: string | null;
  roleTitleKk: string | null;
  roleTitleEn: string | null;
  department: string;
  image: string | null;
  sortOrder: number;
}

interface Translation {
  id: number;
  namespace: string;
  key: string;
  ru: string;
  kk: string | null;
  en: string | null;
}

// ==================== STATS TAB ====================

function StatsTab() {
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    label: "",
    labelKk: "",
    labelEn: "",
    iconType: "default",
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const iconOptions = [
    { value: "mapPin", label: "Геолокация", icon: <MapPin className="h-4 w-4" /> },
    { value: "users", label: "Люди", icon: <Users className="h-4 w-4" /> },
    { value: "badge", label: "Бейдж", icon: <Activity className="h-4 w-4" /> },
    { value: "trophy", label: "Трофей", icon: <Trophy className="h-4 w-4" /> },
    { value: "default", label: "По умолчанию", icon: <Activity className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({
      key: "",
      value: "",
      label: "",
      labelKk: "",
      labelEn: "",
      iconType: "default",
      sortOrder: stats.length,
      isActive: true,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: SiteStat) {
    setEditingId(item.id);
    setFormData({
      key: item.key,
      value: item.value,
      label: item.label,
      labelKk: item.labelKk || "",
      labelEn: item.labelEn || "",
      iconType: item.iconType,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.key.trim() || !formData.value.trim() || !formData.label.trim()) {
      toast.error("Ключ, значение и название обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/stats/${editingId}` : "/api/stats";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Статистика обновлена" : "Статистика добавлена");
        setDialogOpen(false);
        fetchStats();
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
      const res = await fetch(`/api/stats/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Статистика удалена");
        setDeleteDialogOpen(false);
        fetchStats();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: SiteStat) {
    try {
      await fetch(`/api/stats/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchStats();
    } catch {
      // silently fail
    }
  }

  const getIconByType = (type: string) => {
    const option = iconOptions.find((o) => o.value === type);
    return option?.icon || <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Статистика сайта</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Иконка</TableHead>
              <TableHead>Ключ</TableHead>
              <TableHead>Значение</TableHead>
              <TableHead>Название (RU)</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : stats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              stats.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="p-2 rounded-full bg-primary/10 text-primary inline-flex">
                      {getIconByType(item.iconType)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.key}</TableCell>
                  <TableCell className="font-bold text-primary">{item.value}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
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
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeleteDialogOpen(true);
                        }}
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
            <DialogTitle>{editingId ? "Редактировать" : "Добавить статистику"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ключ *</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="regions"
                  disabled={!!editingId}
                />
              </div>
              <div className="grid gap-2">
                <Label>Значение *</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="20+"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Название (RU) *</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                onBlur={createTranslationBlurHandler(formData, setFormData, "label", "labelKk", "labelEn")}
                placeholder="Регионы и филиалы"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (KK)</Label>
                <Input
                  value={formData.labelKk}
                  onChange={(e) => setFormData({ ...formData, labelKk: e.target.value })}
                  placeholder="Аймақтар мен филиалдар"
                />
              </div>
              <div className="grid gap-2">
                <Label>Название (EN)</Label>
                <Input
                  value={formData.labelEn}
                  onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                  placeholder="Regions and branches"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Иконка</Label>
                <Select
                  value={formData.iconType}
                  onValueChange={(value) => setFormData({ ...formData, iconType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive">Активна</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
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

// ==================== HISTORY TAB ====================

function HistoryTab() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    year: "",
    title: "",
    titleKk: "",
    titleEn: "",
    description: "",
    descriptionKk: "",
    descriptionEn: "",
    iconType: "calendar",
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const iconOptions = [
    { value: "calendar", label: "Календарь", icon: <Calendar className="h-4 w-4" /> },
    { value: "trophy", label: "Трофей", icon: <Trophy className="h-4 w-4" /> },
    { value: "medal", label: "Медаль", icon: <Medal className="h-4 w-4" /> },
    { value: "target", label: "Мишень", icon: <Target className="h-4 w-4" /> },
    { value: "scroll", label: "Свиток", icon: <ScrollText className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/history?limit=100");
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({
      year: "",
      title: "",
      titleKk: "",
      titleEn: "",
      description: "",
      descriptionKk: "",
      descriptionEn: "",
      iconType: "calendar",
      sortOrder: events.length,
      isActive: true,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: HistoryEvent) {
    setEditingId(item.id);
    setFormData({
      year: item.year,
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      description: item.description,
      descriptionKk: item.descriptionKk || "",
      descriptionEn: item.descriptionEn || "",
      iconType: item.iconType,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.year.trim() || !formData.title.trim() || !formData.description.trim()) {
      toast.error("Год, название и описание обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/history/${editingId}` : "/api/history";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Событие обновлено" : "Событие добавлено");
        setDialogOpen(false);
        fetchEvents();
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
      const res = await fetch(`/api/history/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Событие удалено");
        setDeleteDialogOpen(false);
        fetchEvents();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: HistoryEvent) {
    try {
      await fetch(`/api/history/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchEvents();
    } catch {
      // silently fail
    }
  }

  const getIconByType = (type: string) => {
    const option = iconOptions.find((o) => o.value === type);
    return option?.icon || <Calendar className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">История федерации</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Иконка</TableHead>
              <TableHead className="w-[100px]">Год</TableHead>
              <TableHead>Название</TableHead>
              <TableHead className="max-w-xs">Описание</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              events.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="p-2 rounded-full bg-primary/10 text-primary inline-flex">
                      {getIconByType(item.iconType)}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">{item.year}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell>{item.sortOrder}</TableCell>
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
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeleteDialogOpen(true);
                        }}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить событие"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Год *</Label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="1992"
                />
              </div>
              <div className="grid gap-2">
                <Label>Иконка</Label>
                <Select
                  value={formData.iconType}
                  onValueChange={(value) => setFormData({ ...formData, iconType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Название (RU) *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={createTranslationBlurHandler(formData, setFormData, "title", "titleKk", "titleEn")}
                placeholder="Основание федерации"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (KK)</Label>
                <Input
                  value={formData.titleKk}
                  onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })}
                  placeholder="Федерацияның құрылуы"
                />
              </div>
              <div className="grid gap-2">
                <Label>Название (EN)</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Foundation of the federation"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Описание (RU) *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                onBlur={createTranslationBlurHandler(formData, setFormData, "description", "descriptionKk", "descriptionEn")}
                placeholder="Описание события..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Описание (KK)</Label>
              <Textarea
                value={formData.descriptionKk}
                onChange={(e) => setFormData({ ...formData, descriptionKk: e.target.value })}
                placeholder="Оқиға сипаттамасы..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Описание (EN)</Label>
              <Textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Event description..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActiveHistory"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActiveHistory">Активно</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
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

// ==================== STAFF TAB ====================

function StaffTab() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameKk: "",
    nameEn: "",
    role: "staff",
    roleTitle: "",
    roleTitleKk: "",
    roleTitleEn: "",
    department: "leadership",
    image: "",
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const departmentLabels: Record<string, string> = {
    leadership: "Руководство",
    coaching: "Тренерский штаб",
    committee: "Комитет",
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({
      name: "",
      nameKk: "",
      nameEn: "",
      role: "staff",
      roleTitle: "",
      roleTitleKk: "",
      roleTitleEn: "",
      department: "leadership",
      image: "",
      sortOrder: staff.length,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: Staff) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      role: item.role,
      roleTitle: item.roleTitle || "",
      roleTitleKk: item.roleTitleKk || "",
      roleTitleEn: item.roleTitleEn || "",
      department: item.department,
      image: item.image || "",
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error("Имя обязательно");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/staff/${editingId}` : "/api/staff";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Сотрудник обновлён" : "Сотрудник добавлен");
        setDialogOpen(false);
        fetchStaff();
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
      const res = await fetch(`/api/staff/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Сотрудник удалён");
        setDeleteDialogOpen(false);
        fetchStaff();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Руководство и персонал</h2>
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
              <TableHead>Имя</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Отдел</TableHead>
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
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              staff.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.image || undefined} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.roleTitle || item.role}</TableCell>
                  <TableCell>{departmentLabels[item.department] || item.department}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeleteDialogOpen(true);
                        }}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить сотрудника"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя (рус) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={createTranslationBlurHandler(formData, setFormData, "name", "nameKk", "nameEn")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Имя (каз)</Label>
                <Input
                  value={formData.nameKk}
                  onChange={(e) => setFormData({ ...formData, nameKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Имя (англ)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Роль</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="president">Президент</SelectItem>
                    <SelectItem value="vice_president">Вице-президент</SelectItem>
                    <SelectItem value="head_coach">Главный тренер</SelectItem>
                    <SelectItem value="coach">Тренер</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Отдел</Label>
                <Select
                  value={formData.department}
                  onValueChange={(v) => setFormData({ ...formData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leadership">Руководство</SelectItem>
                    <SelectItem value="coaching">Тренерский штаб</SelectItem>
                    <SelectItem value="committee">Комитет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Должность (рус)</Label>
              <Input
                value={formData.roleTitle}
                onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                onBlur={createTranslationBlurHandler(formData, setFormData, "roleTitle", "roleTitleKk", "roleTitleEn")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Должность (каз)</Label>
                <Input
                  value={formData.roleTitleKk}
                  onChange={(e) => setFormData({ ...formData, roleTitleKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Должность (англ)</Label>
                <Input
                  value={formData.roleTitleEn}
                  onChange={(e) => setFormData({ ...formData, roleTitleEn: e.target.value })}
                />
              </div>
            </div>

            <ImageUpload
              label="Фото сотрудника"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="staff"
            />

            <div className="grid gap-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
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

// ==================== TRANSLATIONS TAB ====================

function TranslationsTab() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    namespace: "",
    key: "",
    ru: "",
    kk: "",
    en: "",
  });
  const [saving, setSaving] = useState(false);
  const [filterNamespace, setFilterNamespace] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [namespaces, setNamespaces] = useState<string[]>([]);

  useEffect(() => {
    fetchTranslations();
  }, []);

  async function fetchTranslations() {
    try {
      const res = await fetch("/api/translations?limit=500");
      const data = await res.json();
      if (data.success) {
        setTranslations(data.data);
        if (data.meta?.namespaces) {
          setNamespaces(data.meta.namespaces);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ namespace: namespaces[0] || "Header", key: "", ru: "", kk: "", en: "" });
    setDialogOpen(true);
  }

  function openEditDialog(item: Translation) {
    setEditingId(item.id);
    setFormData({
      namespace: item.namespace,
      key: item.key,
      ru: item.ru,
      kk: item.kk || "",
      en: item.en || "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.namespace.trim() || !formData.key.trim() || !formData.ru.trim()) {
      toast.error("Namespace, ключ и текст (RU) обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/translations/${editingId}` : "/api/translations";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Перевод обновлён" : "Перевод добавлен");
        setDialogOpen(false);
        fetchTranslations();
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
      const res = await fetch(`/api/translations/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Перевод удалён");
        setDeleteDialogOpen(false);
        fetchTranslations();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  const filteredTranslations = translations.filter((item) => {
    const matchesNamespace = filterNamespace === "all" || item.namespace === filterNamespace;
    const matchesSearch =
      searchQuery === "" ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.kk && item.kk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.en && item.en.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesNamespace && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Переводы интерфейса</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ключу или тексту..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterNamespace} onValueChange={setFilterNamespace}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все разделы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все разделы</SelectItem>
            {namespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Показано: {filteredTranslations.length} из {translations.length}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Namespace</TableHead>
              <TableHead className="w-[150px]">Ключ</TableHead>
              <TableHead>RU</TableHead>
              <TableHead className="w-[60px] text-center">KK</TableHead>
              <TableHead className="w-[60px] text-center">EN</TableHead>
              <TableHead className="w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {item.namespace}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item.key}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.ru}</TableCell>
                  <TableCell className="text-center">
                    {item.kk ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.en ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 mx-auto" />
                    )}
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
                        onClick={() => {
                          setDeletingId(item.id);
                          setDeleteDialogOpen(true);
                        }}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать перевод" : "Добавить перевод"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Namespace *</Label>
                <Select
                  value={formData.namespace}
                  onValueChange={(value) => setFormData({ ...formData, namespace: value })}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите раздел" />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns) => (
                      <SelectItem key={ns} value={ns}>
                        {ns}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ Новый раздел</SelectItem>
                  </SelectContent>
                </Select>
                {formData.namespace === "__new__" && (
                  <Input
                    placeholder="Введите название раздела"
                    onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label>Ключ *</Label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="title"
                  disabled={!!editingId}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Русский (RU) *</Label>
              <Textarea
                value={formData.ru}
                onChange={(e) => setFormData({ ...formData, ru: e.target.value })}
                placeholder="Введите текст на русском..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Казахский (KK)</Label>
              <Textarea
                value={formData.kk}
                onChange={(e) => setFormData({ ...formData, kk: e.target.value })}
                placeholder="Қазақша мәтінді енгізіңіз..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Английский (EN)</Label>
              <Textarea
                value={formData.en}
                onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                placeholder="Enter text in English..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>Вы уверены? Это действие нельзя отменить.</DialogDescription>
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

// ==================== MAIN PAGE ====================

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Управление контентом</h1>

      <Tabs defaultValue="translations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="translations" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Переводы
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Статистика
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            История
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Руководство
          </TabsTrigger>
        </TabsList>

        <TabsContent value="translations" className="mt-6">
          <TranslationsTab />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
