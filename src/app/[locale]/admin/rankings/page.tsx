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

interface TeamMember {
  id: number;
  name: string;
  type: string;
}

interface RankingEntry {
  id: number;
  teamMemberId: number;
  points: number;
  rank: number;
  previousRank: number | null;
  classification: string | null;
  season: string;
  teamMember: TeamMember;
}

const defaultFormData = {
  teamMemberId: 0,
  points: 0,
  rank: 1,
  previousRank: null as number | null,
  classification: "",
  season: "2025",
};

export default function AdminRankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [rankingsRes, teamRes] = await Promise.all([
        fetch("/api/rankings?limit=100"),
        fetch("/api/team?limit=100"),
      ]);
      const rankingsData = await rankingsRes.json();
      const teamData = await teamRes.json();

      if (rankingsData.success) setRankings(rankingsData.data);
      if (teamData.success) setTeamMembers(teamData.data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, teamMemberId: teamMembers[0]?.id || 0 });
    setDialogOpen(true);
  }

  function openEditDialog(item: RankingEntry) {
    setEditingId(item.id);
    setFormData({
      teamMemberId: item.teamMemberId,
      points: item.points,
      rank: item.rank,
      previousRank: item.previousRank,
      classification: item.classification || "",
      season: item.season,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.teamMemberId) {
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
          previousRank: formData.previousRank || null,
          classification: formData.classification || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Запись обновлена" : "Запись добавлена");
        setDialogOpen(false);
        fetchData();
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
      const res = await fetch(`/api/rankings/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Запись удалена");
        setDeleteDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Рейтинг</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Ранг</TableHead>
              <TableHead>Спортсмен</TableHead>
              <TableHead>Лук</TableHead>
              <TableHead>Очки</TableHead>
              <TableHead>Классификация</TableHead>
              <TableHead>Сезон</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : rankings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Нет данных</TableCell>
              </TableRow>
            ) : (
              rankings.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">#{item.rank}</TableCell>
                  <TableCell className="font-medium">{item.teamMember.name}</TableCell>
                  <TableCell>{item.teamMember.type}</TableCell>
                  <TableCell className="font-mono font-bold text-primary">{item.points}</TableCell>
                  <TableCell>{item.classification || "-"}</TableCell>
                  <TableCell>{item.season}</TableCell>
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
            <div className="grid gap-2">
              <Label>Спортсмен *</Label>
              <Select
                value={formData.teamMemberId.toString()}
                onValueChange={(v) => setFormData({ ...formData, teamMemberId: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите спортсмена" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} ({m.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Предыдущий ранг</Label>
                <Input
                  type="number"
                  value={formData.previousRank || ""}
                  onChange={(e) => setFormData({ ...formData, previousRank: e.target.value ? parseInt(e.target.value) : null })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Сезон</Label>
                <Select value={formData.season} onValueChange={(v) => setFormData({ ...formData, season: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Классификация</Label>
              <Select value={formData.classification} onValueChange={(v) => setFormData({ ...formData, classification: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не указана</SelectItem>
                  <SelectItem value="International">Международная</SelectItem>
                  <SelectItem value="National">Национальная</SelectItem>
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
