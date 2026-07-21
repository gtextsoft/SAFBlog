"use client";

import { useCallback, useRef, useState, type ComponentType } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Eye,
  PenLine,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tool = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  action: (value: string, start: number, end: number) => { next: string; cursor: number };
};

function wrap(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder = "text",
) {
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return { next, cursor: start + before.length + selected.length + after.length };
}

function prefixLines(value: string, start: number, end: number, prefix: string) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = (() => {
    const i = value.indexOf("\n", end);
    return i === -1 ? value.length : i;
  })();
  const block = value.slice(lineStart, lineEnd);
  const nextBlock = block
    .split("\n")
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line || "item"}`))
    .join("\n");
  const next = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
  return { next, cursor: lineStart + nextBlock.length };
}

const TOOLS: Tool[] = [
  {
    label: "Bold",
    icon: Bold,
    action: (v, s, e) => wrap(v, s, e, "**", "**", "bold text"),
  },
  {
    label: "Italic",
    icon: Italic,
    action: (v, s, e) => wrap(v, s, e, "_", "_", "italic text"),
  },
  {
    label: "Heading 2",
    icon: Heading2,
    action: (v, s, e) => prefixLines(v, s, e, "## "),
  },
  {
    label: "Heading 3",
    icon: Heading3,
    action: (v, s, e) => prefixLines(v, s, e, "### "),
  },
  {
    label: "Bullet list",
    icon: List,
    action: (v, s, e) => prefixLines(v, s, e, "- "),
  },
  {
    label: "Numbered list",
    icon: ListOrdered,
    action: (v, s, e) => prefixLines(v, s, e, "1. "),
  },
  {
    label: "Quote",
    icon: Quote,
    action: (v, s, e) => prefixLines(v, s, e, "> "),
  },
  {
    label: "Inline code",
    icon: Code,
    action: (v, s, e) => wrap(v, s, e, "`", "`", "code"),
  },
  {
    label: "Link",
    icon: Link2,
    action: (v, s, e) => {
      const selected = v.slice(s, e) || "link text";
      const inserted = `[${selected}](https://)`;
      const next = v.slice(0, s) + inserted + v.slice(e);
      const urlStart = s + selected.length + 3;
      return { next, cursor: urlStart + "https://".length };
    },
  },
  {
    label: "Image",
    icon: ImageIcon,
    action: (v, s, e) => {
      const alt = v.slice(s, e) || "image";
      const inserted = `![${alt}](https://)`;
      const next = v.slice(0, s) + inserted + v.slice(e);
      return { next, cursor: s + inserted.length - 1 };
    },
  },
  {
    label: "Horizontal rule",
    icon: Minus,
    action: (v, s) => {
      const inserted = "\n\n---\n\n";
      const next = v.slice(0, s) + inserted + v.slice(s);
      return { next, cursor: s + inserted.length };
    },
  },
];

export function MarkdownEditor({
  name = "body",
  id = "body",
  label = "Body",
  hint,
  defaultValue = "",
  required,
  rows = 18,
  className,
}: {
  name?: string;
  id?: string;
  label?: string;
  hint?: string;
  defaultValue?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyTool = useCallback((tool: Tool) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const { next, cursor } = tool.action(value, start, end);
    setValue(next);
    setTab("write");
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }, [value]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <label htmlFor={id} className="text-sm font-medium">
            {label}
            {required ? <span className="text-destructive"> *</span> : null}
          </label>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div role="tablist" className="inline-flex rounded border border-border p-0.5">
          {(
            [
              { id: "write", label: "Write", Icon: PenLine },
              { id: "preview", label: "Preview", Icon: Eye },
            ] as const
          ).map(({ id: tabId, label: tabLabel, Icon }) => (
            <button
              key={tabId}
              type="button"
              role="tab"
              aria-selected={tab === tabId}
              onClick={() => setTab(tabId)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3 text-sm transition-colors",
                tab === tabId
                  ? "bg-primary-subtle text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {tabLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/30 p-1.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                type="button"
                title={tool.label}
                aria-label={tool.label}
                onClick={() => applyTool(tool)}
                className="inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Keep textarea mounted so the value always submits */}
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "w-full resize-y bg-background p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            tab === "preview" && "hidden",
          )}
          placeholder={
            "## Hello\n\nWrite your newsletter in **Markdown**.\n\n- Bullet points\n- [Links](https://example.com)\n"
          }
        />

        {tab === "preview" && (
          <div className="min-h-[280px] bg-background p-6">
            {value.trim() ? (
              <div className="prose-editorial max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
