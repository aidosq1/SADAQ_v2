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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

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

const defaultFormData = {
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
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

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
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, sortOrder: staff.length });
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
    } catch (error) {
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
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  const departmentLabels: Record<string, string> = {
    leadership: "Руководство",
    coaching: "Тренерский штаб",
    committee: "Комитет",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Персонал</h1>
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
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Нет данных</TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить сотрудника"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя (рус) *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Имя (каз)</Label>
                <Input value={formData.nameKk} onChange={(e) => setFormData({ ...formData, nameKk: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Имя (англ)</Label>
                <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Роль</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
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
                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
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
              <Input value={formData.roleTitle} onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Должность (каз)</Label>
                <Input value={formData.roleTitleKk} onChange={(e) => setFormData({ ...formData, roleTitleKk: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Должность (англ)</Label>
                <Input value={formData.roleTitleEn} onChange={(e) => setFormData({ ...formData, roleTitleEn: e.target.value })} />
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
              <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
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
