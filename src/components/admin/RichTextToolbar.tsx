"use client";

import { useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ToolbarAction {
  key: string;
  label: string;
  icon: LucideIcon;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

const ACTION_GROUPS: ToolbarAction[][] = [
  [
    { key: "undo", label: "Отменить", icon: Undo2, run: (e) => e.chain().focus().undo().run() },
    { key: "redo", label: "Повторить", icon: Redo2, run: (e) => e.chain().focus().redo().run() },
  ],
  [
    {
      key: "h2",
      label: "Заголовок",
      icon: Heading2,
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      key: "h3",
      label: "Подзаголовок",
      icon: Heading3,
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive("heading", { level: 3 }),
    },
  ],
  [
    { key: "bold", label: "Жирный", icon: Bold, run: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive("bold") },
    { key: "italic", label: "Курсив", icon: Italic, run: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive("italic") },
    { key: "underline", label: "Подчёркнутый", icon: Underline, run: (e) => e.chain().focus().toggleUnderline().run(), isActive: (e) => e.isActive("underline") },
    { key: "strike", label: "Зачёркнутый", icon: Strikethrough, run: (e) => e.chain().focus().toggleStrike().run(), isActive: (e) => e.isActive("strike") },
  ],
  [
    { key: "bulletList", label: "Список", icon: List, run: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive("bulletList") },
    { key: "orderedList", label: "Нумерованный список", icon: ListOrdered, run: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive("orderedList") },
    { key: "blockquote", label: "Цитата", icon: Quote, run: (e) => e.chain().focus().toggleBlockquote().run(), isActive: (e) => e.isActive("blockquote") },
    { key: "hr", label: "Разделитель", icon: Minus, run: (e) => e.chain().focus().setHorizontalRule().run() },
  ],
];

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || /^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

interface ToolbarButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, icon: Icon, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && "bg-accent text-accent-foreground")}
    >
      <Icon />
    </Button>
  );
}

interface RichTextToolbarProps {
  editor: Editor | null;
  uploadFolder: string;
}

export function RichTextToolbar({ editor, uploadFolder }: RichTextToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Re-render toolbar only when active marks/nodes change
  const activeKeys = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? ACTION_GROUPS.flat()
            .filter((action) => action.isActive?.(current))
            .map((action) => action.key)
            .concat(current.isActive("link") ? ["link"] : [])
        : [],
  });

  function openLinkInput() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = normalizeUrl(linkUrl);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) {
      chain.setLink({ href }).run();
    } else {
      chain.unsetLink().run();
    }
    setLinkOpen(false);
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  }

  async function uploadImage(file: File) {
    if (!editor) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Только изображения");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadFolder);

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok && data.success) {
        editor.chain().focus().setImage({ src: data.data.url, alt: "" }).run();
      } else {
        toast.error(data.error || "Ошибка загрузки");
      }
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadImage(file);
  }

  const disabled = !editor;
  const linkActive = activeKeys?.includes("link") ?? false;

  return (
    <div className="border-b">
      <div className="flex flex-wrap items-center gap-0.5 p-1">
        {ACTION_GROUPS.map((group, index) => (
          <div key={index} className={cn("flex items-center gap-0.5", index > 0 && "border-l pl-1 ml-1")}>
            {group.map((action) => (
              <ToolbarButton
                key={action.key}
                label={action.label}
                icon={action.icon}
                active={activeKeys?.includes(action.key)}
                disabled={disabled}
                onClick={() => editor && action.run(editor)}
              />
            ))}
          </div>
        ))}
        <div className="flex items-center gap-0.5 border-l pl-1 ml-1">
          <ToolbarButton label="Ссылка" icon={Link} active={linkActive} disabled={disabled} onClick={openLinkInput} />
          <ToolbarButton
            label="Изображение"
            icon={uploading ? Loader2 : ImagePlus}
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          />
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {linkOpen && (
        <div className="flex items-center gap-2 border-t p-2">
          <Input
            autoFocus
            value={linkUrl}
            placeholder="https://"
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            className="h-8"
          />
          <Button type="button" size="sm" onClick={applyLink}>
            OK
          </Button>
          {linkActive && (
            <Button type="button" size="sm" variant="ghost" title="Убрать ссылку" aria-label="Убрать ссылку" onClick={removeLink}>
              <Unlink />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
