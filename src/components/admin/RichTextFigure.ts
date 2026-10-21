import { mergeAttributes, Node } from "@tiptap/react";

const CAPTION_PLACEHOLDER = "Подпись к фото";

// Фото с подписью в тексте новости: <figure><img><figcaption>подпись</figcaption></figure>.
// Подпись — обычный текст под фото, она же становится alt картинки.
export const RichTextFigure = Node.create({
  name: "figure",
  group: "block",
  content: "inline*",
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.querySelector("img")?.getAttribute("src") ?? null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure", contentElement: "figcaption" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(HTMLAttributes),
      ["img", { src: node.attrs.src, alt: node.textContent }],
      ["figcaption", 0],
    ];
  },

  // В редакторе картинка не редактируется, подпись — да; пустая подпись показывает подсказку
  addNodeView() {
    return ({ node: initialNode }) => {
      let current = initialNode;

      const dom = document.createElement("figure");
      const img = document.createElement("img");
      img.src = current.attrs.src;
      img.alt = "";
      img.contentEditable = "false";
      img.draggable = false;

      const caption = document.createElement("figcaption");
      caption.dataset.placeholder = CAPTION_PLACEHOLDER;
      const syncEmpty = () => caption.toggleAttribute("data-empty", current.content.size === 0);
      syncEmpty();

      dom.append(img, caption);

      return {
        dom,
        contentDOM: caption,
        update: (updated) => {
          if (updated.type !== current.type) return false;
          current = updated;
          if (img.getAttribute("src") !== updated.attrs.src) img.src = updated.attrs.src;
          syncEmpty();
          return true;
        },
      };
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter в подписи — новый абзац после фото, а не второе такое же фото
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== this.name) return false;
        const after = $from.after();
        return editor.chain().insertContentAt(after, { type: "paragraph" }).setTextSelection(after + 1).run();
      },
      // Backspace в начале подписи выделяет фото целиком, второй Backspace его удаляет
      Backspace: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty || $from.parent.type.name !== this.name || $from.parentOffset !== 0) return false;
        return editor.commands.setNodeSelection($from.before());
      },
    };
  },
});
