"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { Plus, Pencil, Trash2, Image, Folder } from "lucide-react";
import { toast } from "sonner";
import { BulkUploadDialog } from "@/components/admin/BulkUploadDialog";
import { AlbumEditDialog } from "@/components/admin/AlbumEditDialog";
import { deleteGalleryGroup } from "@/lib/actions/gallery";

interface GalleryItem {
  id: number;
  title: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  albumName: string | null;
  eventDate: string | null;
  isPublished: boolean;
}

interface AlbumGroup {
  name: string;
  items: GalleryItem[];
  eventDate: string | null;
  isPublished: boolean;
  coverUrl: string;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<AlbumGroup | null>(null);
  const [deleteAlbumName, setDeleteAlbumName] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      // Fetch more items to ensure we get a good view of groupings. 
      // Ideally API should return grouped data, but for now client-side grouping.
      const res = await fetch("/api/gallery?limit=500");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  // Group items by albumName
  const albums = useMemo(() => {
    const groups: Record<string, AlbumGroup> = {};
    const noAlbumKey = "Без альбома"; // Key for items without album

    items.forEach(item => {
      const key = item.albumName || noAlbumKey;
      if (!groups[key]) {
        groups[key] = {
          name: key,
          items: [],
          eventDate: item.eventDate, // Take first available date
          isPublished: item.isPublished, // Take status of first item
          coverUrl: item.thumbnailUrl || item.url,
        };
      }
      groups[key].items.push(item);
    });

    return Object.values(groups).sort((a, b) => {
      // Sort by date desc
      if (a.eventDate && b.eventDate) return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      return 0;
    });
  }, [items]);

  async function handleDeleteAlbum() {
    if (!deleteAlbumName) return;

    try {
      const result = await deleteGalleryGroup(deleteAlbumName);
      if (result.success) {
        toast.success(result.message);
        setDeleteAlbumName(null);
        fetchItems();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Галерея</h1>
        <div className="flex gap-2">
          <BulkUploadDialog onSuccess={fetchItems} />
          {/* Legacy Add Single Item button removed/hidden to encourage Bulk/Album workflow, 
               or we could keep it but force album name? Let's just rely on Bulk for now as it's better UX. */}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Обложка</TableHead>
              <TableHead>Альбом</TableHead>
              <TableHead>Кол-во</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="w-[150px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : albums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Нет альбомов</TableCell>
              </TableRow>
            ) : (
              albums.map((album) => (
                <TableRow key={album.name}>
                  <TableCell>
                    <div
                      className="w-16 h-12 bg-cover bg-center rounded border"
                      style={{ backgroundImage: `url(${album.coverUrl})` }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-muted-foreground" />
                      {album.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      {album.items.length}
                    </span>
                  </TableCell>
                  <TableCell>{album.eventDate ? new Date(album.eventDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingAlbum(album)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteAlbumName(album.name)}
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

      <AlbumEditDialog
        isOpen={!!editingAlbum}
        onClose={() => setEditingAlbum(null)}
        album={editingAlbum}
        onSuccess={fetchItems}
      />

      <Dialog open={!!deleteAlbumName} onOpenChange={(open) => !open && setDeleteAlbumName(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить альбом?</DialogTitle>
            <DialogDescription>
              Вы собираетесь удалить альбом "{deleteAlbumName}" и все фотографии ({albums.find(a => a.name === deleteAlbumName)?.items.length} шт.) в нём. Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAlbumName(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteAlbum}>Удалить все</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
