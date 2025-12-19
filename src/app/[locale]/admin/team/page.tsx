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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { KAZAKHSTAN_REGIONS } from "@/lib/constants";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface TeamMember {
  id: number;
  slug: string;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  type: string;
  gender: string;
  category: string;
  region: string;
  coachName: string | null;
  image: string | null;
  bio: string | null;
  bioKk: string | null;
  bioEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

const defaultFormData = {
  name: "",
  nameKk: "",
  nameEn: "",
  type: "Recurve",
  gender: "M",
  category: "Adults",
  region: "almaty",
  coachName: "",
  image: "",
  bio: "",
  bioKk: "",
  bioEn: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminTeamPage() {
  const locale = useLocale();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/team?limit=100");
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, sortOrder: members.length });
    setDialogOpen(true);
  }

  function openEditDialog(item: TeamMember) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      type: item.type,
      gender: item.gender,
      category: item.category,
      region: item.region,
      coachName: item.coachName || "",
      image: item.image || "",
      bio: item.bio || "",
      bioKk: item.bioKk || "",
      bioEn: item.bioEn || "",
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
    if (!formData.name.trim()) {
      toast.error("Имя обязательно");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/team/${editingId}` : "/api/team";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Спортсмен обновлён" : "Спортсмен добавлен");
        setDialogOpen(false);
        fetchMembers();
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
      const res = await fetch(`/api/team/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Спортсмен удалён");
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchMembers();
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: TeamMember) {
    try {
      const res = await fetch(`/api/team/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Toggle error:", error);
    }
  }

  const title = locale === "kk" ? "Команда" : locale === "en" ? "Team" : "Команда";

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
              <TableHead className="w-[60px]">Фото</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Лук</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Регион</TableHead>
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
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              members.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.image || undefined} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.gender === "M" ? "Муж" : "Жен"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {KAZAKHSTAN_REGIONS.find((r) => r.id === item.region)?.name || item.region}
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
            <DialogTitle>{editingId ? "Редактировать" : "Добавить спортсмена"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя (рус) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Тип лука</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recurve">Классический</SelectItem>
                    <SelectItem value="Compound">Блочный</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Пол</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Мужской</SelectItem>
                    <SelectItem value="F">Женский</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Категория</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adults">Взрослые</SelectItem>
                    <SelectItem value="Youth">Молодёжь</SelectItem>
                    <SelectItem value="Juniors">Юниоры</SelectItem>
                    <SelectItem value="Cadets">Кадеты</SelectItem>
                    <SelectItem value="Cubs">Юноши</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Регион</Label>
                <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KAZAKHSTAN_REGIONS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Тренер</Label>
                <Input
                  value={formData.coachName}
                  onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                />
              </div>
            </div>

            <ImageUpload
              label="Фото спортсмена"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="team"
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
              <Label>Биография (рус)</Label>
              <Textarea
                rows={2}
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
            <DialogDescription>Вы уверены, что хотите удалить этого спортсмена?</DialogDescription>
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
