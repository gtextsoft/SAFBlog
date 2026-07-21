"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Youtube from "@tiptap/extension-youtube";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Youtube as YoutubeIcon,
} from "lucide-react";

import { uploadContentImage } from "@/app/admin/(dashboard)/posts/actions";
import { cn } from "@/lib/utils";

function looksLikeHtml(value: string): boolean {
  return /^<[a-z][\s\S]*>/i.test(value.trim());
}

async function toEditorHtml(value: string): Promise<string> {
  if (!value.trim()) return "<p></p>";
  if (looksLikeHtml(value)) return value;
  const { marked } = await import("marked");
  marked.setOptions({ gfm: true, breaks: false });
  return String(await marked.parse(value));
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-40",
        active && "bg-primary-subtle text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name = "content",
  initialContent = "",
  onDirty,
  className,
}: {
  name?: string;
  initialContent?: string;
  onDirty?: () => void;
  className?: string;
}) {
  const [html, setHtml] = useState(initialContent);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded max-w-full h-auto" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your story…",
      }),
      CharacterCount,
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: { class: "rounded overflow-hidden my-4" },
      }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "prose-editorial min-h-[420px] max-w-none px-5 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      setHtml(ed.getHTML());
      onDirty?.();
    },
  });

  useEffect(() => {
    if (!editor || loadedRef.current) return;
    let cancelled = false;
    (async () => {
      const content = await toEditorHtml(initialContent);
      if (cancelled) return;
      editor.commands.setContent(content, { emitUpdate: false });
      setHtml(editor.getHTML());
      loadedRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [editor, initialContent]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  async function onImageFile(file: File) {
    if (!editor) return;
    setUploading(true);
    setUploadError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const result = await uploadContentImage(data);
      if (result.error) setUploadError(result.error);
      else if (result.url) {
        editor.chain().focus().setImage({ src: result.url }).run();
        onDirty?.();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
        Loading editor…
      </div>
    );
  }

  const words = editor.storage.characterCount?.words?.() ?? 0;
  const chars = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={html} />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/30 p-1.5">
          <ToolbarBtn label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarBtn>

          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />

          <ToolbarBtn label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Inline code"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </ToolbarBtn>

          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />

          <ToolbarBtn
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarBtn>

          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />

          <ToolbarBtn
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarBtn>

          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />

          <ToolbarBtn
            label="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            label="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarBtn>

          <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />

          <ToolbarBtn label="Link" active={editor.isActive("link")} onClick={setLink}>
            <Link2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Insert image" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          </ToolbarBtn>
          <ToolbarBtn label="YouTube" onClick={addYoutube}>
            <YoutubeIcon className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        <EditorContent editor={editor} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <span>
            <span data-numeric>{words}</span> words · <span data-numeric>{chars}</span> characters
          </span>
          <span>Rich text — headings, lists, links, images, embeds</span>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImageFile(file);
        }}
      />
      {uploadError && (
        <p role="alert" className="text-xs text-destructive">
          {uploadError}
        </p>
      )}
    </div>
  );
}
