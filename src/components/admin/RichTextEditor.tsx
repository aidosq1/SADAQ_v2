"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import { toNewsHtml } from "@/lib/news-content";
import { RichTextToolbar } from "./RichTextToolbar";

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: toNewsHtml(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[240px] px-3 py-2 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(getEditorValue(current)),
    onBlur: () => onBlurRef.current?.(),
  });

  // Pick up external changes: another record opened, translation auto-filled
  useEffect(() => {
    if (!editor || value === getEditorValue(editor)) return;
    editor.commands.setContent(toNewsHtml(value), { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className={cn("rounded-md border bg-background", className)}>
      <RichTextToolbar editor={editor} uploadFolder={uploadFolder} />
      <EditorContent editor={editor} />
    </div>
  );
}
