"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toNewsHtml } from "@/lib/news-content";
import { pickImageFiles } from "@/lib/news-image";
import { RichTextToolbar } from "./RichTextToolbar";
import { RichTextFigure } from "./RichTextFigure";
import { uploadEditorImage } from "./rich-text-upload";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  uploadFolder?: string;
  className?: string;
}

// Empty editor is stored as "" so required/auto-fill checks keep working
function getEditorValue(editor: Editor): string {
  return editor.isEmpty ? "" : editor.getHTML();
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  uploadFolder = "images",
  className,
}: RichTextEditorProps) {
  // Editor callbacks are bound once, refs keep them pointing at the latest props
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  });

  const editorRef = useRef<Editor | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  // Загружает фото по одному и вставляет их подряд в позицию pos как фото с подписью
  const insertImages = useCallback(
    async (files: File[], pos: number) => {
      if (files.length === 0) return;
      setUploadingCount((count) => count + 1);
      try {
        const urls: string[] = [];
        for (const file of files) {
          try {
            urls.push(await uploadEditorImage(file, uploadFolder));
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
          }
        }

        const editor = editorRef.current;
        if (!editor || editor.isDestroyed || urls.length === 0) return;
        // Пока фото грузилось, текст могли сократить
        const at = Math.min(pos, editor.state.doc.content.size);
        editor
          .chain()
          .focus()
          .insertContentAt(at, urls.map((src) => ({ type: RichTextFigure.name, attrs: { src } })))
          .run();
      } finally {
        setUploadingCount((count) => count - 1);
      }
    },
    [uploadFolder]
  );

  const insertImagesRef = useRef(insertImages);
  useEffect(() => {
    insertImagesRef.current = insertImages;
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      Image,
      RichTextFigure,
    ],
    content: toNewsHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[240px] px-3 py-2 focus:outline-none",
      },
      // Скриншот или скопированная картинка; при вставке текста (из Word и т.п.) работает обычная вставка
      handlePaste: (view, event) => {
        const clipboard = event.clipboardData;
        if (!clipboard || clipboard.getData("text/plain").trim()) return false;
        const files = pickImageFiles(clipboard.files);
        if (files.length === 0) return false;
        event.preventDefault();
        insertImagesRef.current(files, view.state.selection.from);
        return true;
      },
      // Фото, перетащенные из папки, встают туда, куда их бросили
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer) return false;
        const files = pickImageFiles(event.dataTransfer.files);
        if (files.length === 0) return false;
        event.preventDefault();
        const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImagesRef.current(files, dropPos ?? view.state.selection.from);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(getEditorValue(current)),
    onBlur: () => onBlurRef.current?.(),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Pick up external changes: another record opened, translation auto-filled
  useEffect(() => {
    if (!editor || value === getEditorValue(editor)) return;
    editor.commands.setContent(toNewsHtml(value), { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className={cn("rounded-md border bg-background", className)}>
      <RichTextToolbar
        editor={editor}
        uploading={uploadingCount > 0}
        onPickImages={(files) => editor && insertImages(files, editor.state.selection.from)}
      />
      <EditorContent editor={editor} />
    </div>
  );
}
