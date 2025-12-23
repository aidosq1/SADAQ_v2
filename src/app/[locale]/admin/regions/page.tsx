"use client";

import { useState, useEffect, Fragment } from "react";
import { useTranslationForm } from "@/hooks/useTranslationForm";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Key,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";

interface RegionUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
}

interface Region {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  director: string;
  directorKk: string | null;
  directorEn: string | null;
  address: string;
  addressKk: string | null;
  addressEn: string | null;
  phone: string;
  email: string | null;
  sortOrder: number;
  isActive: boolean;
  users?: RegionUser[];
  _count?: {
    athletes: number;
    coaches: number;
    judges: number;
  };
}

const defaultFormData = {
  name: "",
  nameKk: "",
  nameEn: "",
  director: "",
  directorKk: "",
  directorEn: "",
  address: "",
  addressKk: "",
  addressEn: "",
  phone: "",
  email: "",
  sortOrder: 0,
  isActive: true,
};

const TRANSLATION_FIELDS = {
  name: { kk: "nameKk", en: "nameEn" },
  director: { kk: "directorKk", en: "directorEn" },
  address: { kk: "addressKk", en: "addressEn" },
};

const defaultUserFormData = {
  username: "",
  password: "",
  email: "",
  role: "RegionalRepresentative",
};

export default function AdminRegionsPage() {
  const locale = useLocale();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const { formData, setFormData, handleTranslationBlur } = useTranslationForm(
    defaultFormData,
    TRANSLATION_FIELDS
  );
  const [userFormData, setUserFormData] = useState(defaultUserFormData);
  const [saving, setSaving] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [regionUsers, setRegionUsers] = useState<Record<number, RegionUser[]>>({});

  useEffect(() => {
    fetchRegions();
  }, []);

  async function fetchRegions() {
    try {
      const res = await fetch("/api/regions?limit=100");
      const data = await res.json();
      if (data.success) {
        setRegions(data.data);
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegionUsers(regionId: number) {
    try {
      const res = await fetch(`/api/regions/${regionId}/users`);
      const data = await res.json();
      if (data.success) {
        setRegionUsers((prev) => ({ ...prev, [regionId]: data.data }));
      }
    } catch {
      // silently fail
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, sortOrder: regions.length });
    setDialogOpen(true);
  }

  function openEditDialog(item: Region) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      director: item.director,
      directorKk: item.directorKk || "",
      directorEn: item.directorEn || "",
      address: item.address,
      addressKk: item.addressKk || "",
      addressEn: item.addressEn || "",
      phone: item.phone,
      email: item.email || "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function openUserDialog(regionId: number, user?: RegionUser) {
    setSelectedRegionId(regionId);
    if (user) {
      setEditingUserId(user.id);
      setUserFormData({
        username: user.username,
        password: "",
        email: user.email || "",
        role: user.role,
      });
    } else {
      setEditingUserId(null);
      setUserFormData(defaultUserFormData);
    }
    setUserDialogOpen(true);
  }

  function openDeleteUserDialog(regionId: number, userId: number) {
    setSelectedRegionId(regionId);
    setDeletingUserId(userId);
    setDeleteUserDialogOpen(true);
  }

  async function toggleExpand(regionId: number) {
    if (expandedRegion === regionId) {
      setExpandedRegion(null);
    } else {
      setExpandedRegion(regionId);
      if (!regionUsers[regionId]) {
        await fetchRegionUsers(regionId);
      }
    }
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error("Название обязательно");
      return;
    }
    if (!formData.director.trim()) {
      toast.error("Имя директора обязательно");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Адрес обязателен");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Телефон обязателен");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/regions/${editingId}` : "/api/regions";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Регион обновлён" : "Регион добавлен");
        setDialogOpen(false);
        fetchRegions();
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
      const res = await fetch(`/api/regions/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Регион удалён");
        setDeleteDialogOpen(false);
        setDeletingId(null);
        fetchRegions();
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function handleSaveUser() {
    if (!selectedRegionId) return;

    if (!userFormData.username.trim()) {
      toast.error("Логин обязателен");
      return;
    }
    if (!editingUserId && !userFormData.password.trim()) {
      toast.error("Пароль обязателен");
      return;
    }

    setSaving(true);
    try {
      const url = editingUserId
        ? `/api/regions/${selectedRegionId}/users/${editingUserId}`
        : `/api/regions/${selectedRegionId}/users`;
      const method = editingUserId ? "PATCH" : "POST";

      const body = editingUserId
        ? {
            username: userFormData.username,
            email: userFormData.email || null,
            role: userFormData.role,
            ...(userFormData.password && { password: userFormData.password }),
          }
        : userFormData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingUserId ? "Пользователь обновлён" : "Пользователь создан");
        setUserDialogOpen(false);
        fetchRegionUsers(selectedRegionId);
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser() {
    if (!selectedRegionId || !deletingUserId) return;

    try {
      const res = await fetch(`/api/regions/${selectedRegionId}/users/${deletingUserId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Пользователь удалён");
        setDeleteUserDialogOpen(false);
        setDeletingUserId(null);
        fetchRegionUsers(selectedRegionId);
      } else {
        toast.error(data.error || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: Region) {
    try {
      const res = await fetch(`/api/regions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        fetchRegions();
      }
    } catch {
      // silently fail
    }
  }

  const title = locale === "kk" ? "Аймақтар" : locale === "en" ? "Regions" : "Регионы";

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
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Директор</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Учётки</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[120px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : regions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Нет регионов
                </TableCell>
              </TableRow>
            ) : (
              regions.map((item) => (
                <Fragment key={item.id}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedRegion === item.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{item.name}</div>
                      {item.email && (
                        <div className="text-xs text-muted-foreground">{item.email}</div>
                      )}
                    </TableCell>
                    <TableCell>{item.director}</TableCell>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUserDialog(item.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
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
                  {expandedRegion === item.id && (
                    <TableRow key={`${item.id}-users`}>
                      <TableCell colSpan={7} className="bg-muted/50 p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Users className="h-4 w-4" />
                            Учётные записи региона
                          </div>
                          {regionUsers[item.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {regionUsers[item.id].map((user) => (
                                <div
                                  key={user.id}
                                  className="flex items-center justify-between p-2 bg-background rounded-md border"
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <div className="font-medium">{user.username}</div>
                                      {user.email && (
                                        <div className="text-xs text-muted-foreground">
                                          {user.email}
                                        </div>
                                      )}
                                    </div>
                                    <Badge variant="secondary">{user.role}</Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openUserDialog(item.id, user)}
                                    >
                                      <Key className="h-4 w-4 mr-1" />
                                      Изменить
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => openDeleteUserDialog(item.id, user.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Нет учётных записей
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Region Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать регион" : "Добавить регион"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название (рус) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleTranslationBlur("name")}
                placeholder="Алматы"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (каз)</Label>
                <Input
                  value={formData.nameKk}
                  onChange={(e) => setFormData({ ...formData, nameKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Название (англ)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Директор (рус) *</Label>
              <Input
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                onBlur={() => handleTranslationBlur("director")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Директор (каз)</Label>
                <Input
                  value={formData.directorKk}
                  onChange={(e) => setFormData({ ...formData, directorKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Директор (англ)</Label>
                <Input
                  value={formData.directorEn}
                  onChange={(e) => setFormData({ ...formData, directorEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Адрес (рус) *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                onBlur={() => handleTranslationBlur("address")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Адрес (каз)</Label>
                <Input
                  value={formData.addressKk}
                  onChange={(e) => setFormData({ ...formData, addressKk: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Адрес (англ)</Label>
                <Input
                  value={formData.addressEn}
                  onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Телефон *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (777) 123-45-67"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Порядок сортировки</Label>
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

      {/* Delete Region Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот регион? Удаление возможно только если нет связанных спортсменов, тренеров, судей и учётных записей.
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

      {/* Create/Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUserId ? "Редактировать пользователя" : "Добавить пользователя"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Логин *</Label>
              <Input
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                placeholder="user_almaty"
              />
            </div>

            <div className="grid gap-2">
              <Label>{editingUserId ? "Новый пароль" : "Пароль *"}</Label>
              <Input
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                placeholder={editingUserId ? "Оставьте пустым, чтобы не менять" : ""}
              />
            </div>

            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>

            {/* Роль фиксирована как "Представитель региона" для учёток регионов */}
            <input type="hidden" value="RegionalRepresentative" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSaveUser} disabled={saving}>
              {saving ? "..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтвердить удаление</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту учётную запись?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
