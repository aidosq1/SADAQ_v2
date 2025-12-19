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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, Download } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: number;
  title: string;
  titleKk: string | null;
  titleEn: string | null;
  section: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  isPublished: boolean;
}

const defaultFormData = {
  title: "",
  titleKk: "",
  titleEn: "",
  section: "regulations",
  fileUrl: "",
  fileType: "pdf",
  fileSize: "",
  isPublished: true,
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingId(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  }

  function openEditDialog(item: Document) {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleKk: item.titleKk || "",
      titleEn: item.titleEn || "",
      section: item.section,
      fileUrl: item.fileUrl,
      fileType: item.fileType || "pdf",
      fileSize: item.fileSize || "",
      isPublished: item.isPublished,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.fileUrl.trim()) {
      toast.error("Название и URL файла обязательны");
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/documents/${editingId}` : "/api/documents";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "Документ обновлён" : "Документ добавлен");
        setDialogOpen(false);
        fetchDocuments();
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
      const res = await fetch(`/api/documents/${deletingId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Документ удалён");
        setDeleteDialogOpen(false);
        fetchDocuments();
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  async function togglePublished(item: Document) {
    try {
      await fetch(`/api/documents/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      fetchDocuments();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  }

  const sectionLabels: Record<string, string> = {
    regulations: "Регламенты",
    rules: "Правила",
    protocols: "Протоколы",
    forms: "Формы",
    other: "Другое",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Документы</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Раздел</TableHead>
              <TableHead>Размер</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">Нет данных</TableCell>
              </TableRow>
            ) : (
              documents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.fileType?.toUpperCase()}</span>
                    </div>
                  </TableCell>
                  <TableCell>{sectionLabels[item.section] || item.section}</TableCell>
                  <TableCell>{item.fileSize || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(item)}
                      className={item.isPublished ? "text-green-600" : "text-gray-400"}
                    >
                      {item.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={item.fileUrl} target="_blank">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать" : "Добавить документ"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Название (рус) *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Название (каз)</Label>
                <Input value={formData.titleKk} onChange={(e) => setFormData({ ...formData, titleKk: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Название (англ)</Label>
                <Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Раздел</Label>
              <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulations">Регламенты</SelectItem>
                  <SelectItem value="rules">Правила</SelectItem>
                  <SelectItem value="protocols">Протоколы</SelectItem>
                  <SelectItem value="forms">Формы</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>URL файла *</Label>
              <Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="/documents/file.pdf" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Тип файла</Label>
                <Select value={formData.fileType} onValueChange={(v) => setFormData({ ...formData, fileType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xls">XLS</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Размер файла</Label>
                <Input value={formData.fileSize} onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })} placeholder="1.5 MB" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="isPublished" checked={formData.isPublished} onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked as boolean })} />
              <Label htmlFor="isPublished">Опубликован</Label>
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
