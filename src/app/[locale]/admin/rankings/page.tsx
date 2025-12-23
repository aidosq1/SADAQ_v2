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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { CATEGORIES, GENDERS, BOW_TYPES, DEFAULT_FILTERS, getLocalizedLabel } from "@/lib/constants";

interface Athlete {
  id: number;
  name: string;
  type: string;
  gender: string;
  category: string;
}

interface RankingEntry {
  id: number;
  athleteId: number;
  points: number;
  rank: number;
  classification: string | null;
  category: string;
  gender: string;
  type: string;
  athlete: Athlete;
}

const defaultFormData = {
  athleteId: 0,
  points: 0,
  rank: 1,
  classification: "none",
  category: DEFAULT_FILTERS.category,
  gender: DEFAULT_FILTERS.gender,
  type: DEFAULT_FILTERS.type,
};

export default function AdminRankingsPage() {
  const locale = useLocale();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState(DEFAULT_FILTERS.category);
  const [filterGender, setFilterGender] = useState(DEFAULT_FILTERS.gender);
  const [filterType, setFilterType] = useState(DEFAULT_FILTERS.type);

  useEffect(() => {
    fetchAthletes();
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [filterCategory, filterGender, filterType]);

  async function fetchAthletes() {
    try {
      const res = await fetch("/api/team?all=true&limit=1000");
      const data = await res.json();
      if (data.success) setAthletes(data.data);
    } catch {
      // silently fail
    }
  }

  async function fetchRankings() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings?category=${filterCategory}&gender=${filterGender}&type=${filterType}&limit=100`);
      const data = await res.json();
      if (data.success) setRankings(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    const filteredAthletes = athletes.filter(
      (a) => a.category === filterCategory && a.gender === filterGender && a.type === filterType
    );
    setFormData({
      ...defaultFormData,
      athleteId: filteredAthletes[0]?.id || 0,
      category: filterCategory,
      gender: filterGender,
      type: filterType,
    });
    setDialogOpen(true);
  }

  function openEditDialog(item: RankingEntry) {
    setEditingId(item.id);
    setFormData({
      athleteId: item.athleteId,
      points: item.points,
      rank: item.rank,
      classification: item.classification || "none",
      category: item.category as typeof DEFAULT_FILTERS.category,
      gender: item.gender as typeof DEFAULT_FILTERS.gender,
      type: item.type as typeof DEFAULT_FILTERS.type,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.athleteId) {
      toast.error("Выберите спортсмена");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/rankings/${editingId}` : "/api/rankings";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          classification: formData.classification === "none" ? null : formData.classification,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Запись обновлена" : "Запись добавлена");
        setDialogOpen(false);
        fetchRankings();
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
      const res = await fetch(`/api/rankings/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Запись удалена");
        setDeleteDialogOpen(false);
        fetchRankings();
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  // Filter athletes for the form based on selected category/gender/type
  const filteredAthletes = athletes.filter(
    (a) => a.category === formData.category && a.gender === formData.gender && a.type === formData.type
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Рейтинг</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id)}
            >
              {getLocalizedLabel(cat, locale)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {GENDERS.map((g) => (
            <Button
              key={g.id}
              variant={filterGender === g.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterGender(g.id)}
            >
              {getLocalizedLabel(g, locale)}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {BOW_TYPES.map((t) => (
            <Button
              key={t.id}
              variant={filterType === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(t.id)}
            >
              {getLocalizedLabel(t, locale)}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Ранг</TableHead>
              <TableHead>Спортсмен</TableHead>
              <TableHead>Очки</TableHead>
              <TableHead>Классификация</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : rankings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Нет данных</TableCell>
              </TableRow>
            ) : (
              rankings.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-medium">{item.athlete.name}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{item.points}</TableCell>
                  <TableCell>{item.classification || "-"}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить запись рейтинга"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as typeof DEFAULT_FILTERS.category, athleteId: 0 })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{getLocalizedLabel(cat, locale)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Пол</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as typeof DEFAULT_FILTERS.gender, athleteId: 0 })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{getLocalizedLabel(g, locale)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Тип лука</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as typeof DEFAULT_FILTERS.type, athleteId: 0 })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOW_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{getLocalizedLabel(t, locale)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Спортсмен *</Label>
              <Select
                value={formData.athleteId ? formData.athleteId.toString() : "none"}
                onValueChange={(v) => setFormData({ ...formData, athleteId: v === "none" ? 0 : parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите спортсмена" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAthletes.length === 0 ? (
                    <SelectItem value="none" disabled>Нет спортсменов в этой категории</SelectItem>
                  ) : (
                    filteredAthletes.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Очки *</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Ранг *</Label>
                <Input
                  type="number"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Классификация</Label>
              <Select value={formData.classification} onValueChange={(v) => setFormData({ ...formData, classification: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указана</SelectItem>
                  <SelectItem value="International">МСМК</SelectItem>
                  <SelectItem value="National">МС</SelectItem>
                  <SelectItem value="Candidate">КМС</SelectItem>
                  <SelectItem value="1st Class">1 разряд</SelectItem>
                </SelectContent>
              </Select>
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
