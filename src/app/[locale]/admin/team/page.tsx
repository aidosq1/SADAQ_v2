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
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { CATEGORIES, GENDERS, BOW_TYPES, DEFAULT_FILTERS, getLocalizedLabel } from "@/lib/constants";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface NationalTeamMembership {
  id?: number;
  category: string;
  gender: string;
  type: string;
}

interface Region {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
}

interface Coach {
  id: number;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
}

interface Athlete {
  id: number;
  slug: string;
  name: string;
  nameKk: string | null;
  nameEn: string | null;
  iin: string | null;
  dob: string | null;
  type: string;
  gender: string;
  category: string;
  regionId: number | null;
  regionRef: Region | null;
  image: string | null;
  nationalTeamMemberships: NationalTeamMembership[];
  isActive: boolean;
  sortOrder: number;
  // Свидетельство о регистрации
  registrationNumber: string | null;
  registrationDate: string | null;
  federationName: string | null;
  sportsRank: string | null;
  sportsRankDate: string | null;
  sportsRankOrder: string | null;
  medicalStatus: string | null;
  medicalDate: string | null;
  medicalExpiry: string | null;
  competitionResults: string | null;
  disqualificationInfo: string | null;
  dopingInfo: string | null;
  awardsInfo: string | null;
  coachId: number | null;
  coach: Coach | null;
  additionalInfo: string | null;
}

const defaultFormData = {
  name: "",
  nameKk: "",
  nameEn: "",
  iin: "",
  dob: "",
  gender: DEFAULT_FILTERS.gender,
  regionId: null as number | null,
  image: "",
  nationalTeamMemberships: [] as NationalTeamMembership[],
  isActive: true,
  sortOrder: 0,
  // Свидетельство о регистрации
  registrationNumber: "",
  registrationDate: "",
  federationName: "",
  sportsRank: "",
  sportsRankDate: "",
  sportsRankOrder: "",
  medicalStatus: "",
  medicalDate: "",
  medicalExpiry: "",
  competitionResults: "",
  disqualificationInfo: "",
  dopingInfo: "",
  awardsInfo: "",
  coachId: null as number | null,
  additionalInfo: "",
};

const TRANSLATION_FIELDS = {
  name: { kk: "nameKk", en: "nameEn" },
};

export default function AdminTeamPage() {
  const locale = useLocale();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const userRegion = (session?.user as { region?: string })?.region;
  const isAdmin = userRole === 'Admin' || userRole === 'Editor';

  const [members, setMembers] = useState<Athlete[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const sortedMembers = sortOrder
    ? [...members].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'ru');
        return sortOrder === 'asc' ? comparison : -comparison;
      })
    : members;

  const toggleSort = () => {
    setSortOrder(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null);
  };

  const { formData, setFormData, handleTranslationBlur } = useTranslationForm(
    defaultFormData,
    TRANSLATION_FIELDS
  );
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    fetchMembers();
    fetchRegions();
    fetchCoaches();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/team?all=true&limit=100");
      const data = await res.json();
      if (data.success) {
        setMembers(data.data);
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

  async function fetchCoaches() {
    try {
      const res = await fetch("/api/coaches?admin=true&limit=200");
      const data = await res.json();
      if (data.success) {
        setCoaches(data.data);
      }
    } catch {
      // silently fail
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData({ ...defaultFormData, sortOrder: members.length });
    setDialogOpen(true);
  }

  function formatDateForInput(dateStr: string | null): string {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  function openEditDialog(item: Athlete) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      nameKk: item.nameKk || "",
      nameEn: item.nameEn || "",
      iin: item.iin || "",
      dob: item.dob || "",
      gender: item.gender as typeof DEFAULT_FILTERS.gender,
      regionId: item.regionId,
      image: item.image || "",
      nationalTeamMemberships: item.nationalTeamMemberships || [],
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      // Свидетельство о регистрации
      registrationNumber: item.registrationNumber || "",
      registrationDate: formatDateForInput(item.registrationDate),
      federationName: item.federationName || "",
      sportsRank: item.sportsRank || "",
      sportsRankDate: formatDateForInput(item.sportsRankDate),
      sportsRankOrder: item.sportsRankOrder || "",
      medicalStatus: item.medicalStatus || "",
      medicalDate: formatDateForInput(item.medicalDate),
      medicalExpiry: formatDateForInput(item.medicalExpiry),
      competitionResults: item.competitionResults || "",
      disqualificationInfo: item.disqualificationInfo || "",
      dopingInfo: item.dopingInfo || "",
      awardsInfo: item.awardsInfo || "",
      coachId: item.coachId,
      additionalInfo: item.additionalInfo || "",
    });
    setDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function convertDateToISO(dateStr: string): string {
    if (!dateStr) return "";
    return new Date(dateStr + "T12:00:00").toISOString();
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

      // Convert date strings to ISO with local noon to avoid timezone day shift
      const dataToSend = {
        ...formData,
        dob: formData.dob ? convertDateToISO(formData.dob) : "",
        registrationDate: formData.registrationDate ? convertDateToISO(formData.registrationDate) : null,
        sportsRankDate: formData.sportsRankDate ? convertDateToISO(formData.sportsRankDate) : null,
        medicalDate: formData.medicalDate ? convertDateToISO(formData.medicalDate) : null,
        medicalExpiry: formData.medicalExpiry ? convertDateToISO(formData.medicalExpiry) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Спортсмен обновлён" : "Спортсмен добавлен");
        setDialogOpen(false);
        fetchMembers();
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
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  async function toggleActive(item: Athlete) {
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
    } catch {
      // silently fail
    }
  }

  const title = locale === "kk" ? "Спортсмендер" : locale === "en" ? "Athletes" : "Спортсмены";

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
                  Имя
                  {sortOrder === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : sortOrder === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Нет данных
                </TableCell>
              </TableRow>
            ) : (
              sortedMembers.map((item) => (
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить спортсмена"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя (рус) *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onBlur={() => handleTranslationBlur("name")}
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
                <Label>ИИН</Label>
                <Input
                  value={formData.iin}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                    setFormData({ ...formData, iin: cleaned });
                  }}
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
              <Label>Пол</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v as typeof DEFAULT_FILTERS.gender })}>
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

            {isAdmin && (
              <div className="grid gap-2">
                <Label>Регион</Label>
                <Select
                  value={formData.regionId?.toString() || ""}
                  onValueChange={(v) => setFormData({ ...formData, regionId: v ? parseInt(v) : null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите регион" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {locale === 'kk' && r.nameKk ? r.nameKk : locale === 'en' && r.nameEn ? r.nameEn : r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <ImageUpload
              label="Фото спортсмена"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              folder="team"
            />

            {/* Свидетельство о регистрации спортсмена */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Свидетельство о регистрации</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label>Рег. номер свидетельства</Label>
                  <Input
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="№ свидетельства"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Дата присвоения рег. номера</Label>
                  <Input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2 mb-4">
                <Label>Наименование федерации</Label>
                <Input
                  value={formData.federationName}
                  onChange={(e) => setFormData({ ...formData, federationName: e.target.value })}
                  placeholder="РОО «Федерация стрельбы из лука, арбалета и дартса РК»"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label>Спортивный разряд/звание</Label>
                  <Input
                    value={formData.sportsRank}
                    onChange={(e) => setFormData({ ...formData, sportsRank: e.target.value })}
                    placeholder="напр. МСМК, МС, КМС"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Дата присвоения разряда</Label>
                  <Input
                    type="date"
                    value={formData.sportsRankDate}
                    onChange={(e) => setFormData({ ...formData, sportsRankDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2 mb-4">
                <Label>№ приказа о присвоении разряда</Label>
                <Input
                  value={formData.sportsRankOrder}
                  onChange={(e) => setFormData({ ...formData, sportsRankOrder: e.target.value })}
                  placeholder="Приказ № 256 от 02.06.2021 г."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label>Медицинский допуск</Label>
                  <Select
                    value={formData.medicalStatus || "none"}
                    onValueChange={(v) => setFormData({ ...formData, medicalStatus: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Не указан</SelectItem>
                      <SelectItem value="Допуск">Допуск</SelectItem>
                      <SelectItem value="Не допуск">Не допуск</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Дата мед. осмотра</Label>
                  <Input
                    type="date"
                    value={formData.medicalDate}
                    onChange={(e) => setFormData({ ...formData, medicalDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label>Срок действия допуска</Label>
                  <Input
                    type="date"
                    value={formData.medicalExpiry}
                    onChange={(e) => setFormData({ ...formData, medicalExpiry: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Личный тренер</Label>
                  <Select
                    value={formData.coachId?.toString() || "none"}
                    onValueChange={(v) => setFormData({ ...formData, coachId: v && v !== "none" ? parseInt(v) : null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тренера" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Не указан</SelectItem>
                      {coaches.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {locale === 'kk' && c.nameKk ? c.nameKk : locale === 'en' && c.nameEn ? c.nameEn : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2 mb-4">
                <Label>Результаты на соревнованиях</Label>
                <Textarea
                  value={formData.competitionResults}
                  onChange={(e) => setFormData({ ...formData, competitionResults: e.target.value })}
                  placeholder="Спартакиада народов 2-е место&#10;Чемпионат Казахстана 1-е место 2025 г.&#10;Кубок Мира 3 место 2024 год"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label>Сведения о дисквалификации</Label>
                  <Textarea
                    value={formData.disqualificationInfo}
                    onChange={(e) => setFormData({ ...formData, disqualificationInfo: e.target.value })}
                    placeholder="нет"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Сведения о допинге</Label>
                  <Textarea
                    value={formData.dopingInfo}
                    onChange={(e) => setFormData({ ...formData, dopingInfo: e.target.value })}
                    placeholder="нет"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid gap-2 mb-4">
                <Label>Сведения о наградах</Label>
                <Textarea
                  value={formData.awardsInfo}
                  onChange={(e) => setFormData({ ...formData, awardsInfo: e.target.value })}
                  placeholder="нет"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label>Иные сведения</Label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="нет"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            {isAdmin && (
              <div className="grid gap-2">
                <Label>Членство в сборных</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) =>
                    GENDERS.map((g) =>
                      BOW_TYPES.map((t) => {
                        const key = `${cat.id}-${g.id}-${t.id}`;
                        const isInTeam = formData.nationalTeamMemberships.some(
                          (m) => m.category === cat.id && m.gender === g.id && m.type === t.id
                        );
                        const catLabel = cat.ru.slice(0, 3);
                        const gLabel = g.id === "M" ? "М" : "Ж";
                        const tLabel = t.id === "Recurve" ? "Кл" : "Бл";
                        const label = `${catLabel} ${gLabel} ${tLabel}`;
                        return (
                          <div key={key} className="flex items-center gap-1">
                            <Checkbox
                              id={key}
                              checked={isInTeam}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    nationalTeamMemberships: [
                                      ...formData.nationalTeamMemberships,
                                      { category: cat.id, gender: g.id, type: t.id },
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    nationalTeamMemberships: formData.nationalTeamMemberships.filter(
                                      (m) => !(m.category === cat.id && m.gender === g.id && m.type === t.id)
                                    ),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={key} className="text-xs cursor-pointer">{label}</Label>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              </div>
            )}

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
