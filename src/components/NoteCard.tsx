"use client";
import Link from "next/link";
import { Note } from "@/lib/api";
import { TagBadge } from "@/components/ui/TagBadge";
import { formatDistanceToNow } from "date-fns";
import { Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  view?: "grid" | "list";
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").slice(0, 140);
}

export function NoteCard({ note, view = "grid" }: NoteCardProps) {
  const preview = stripHtml(note.content || "");

  if (view === "list") {
    return (
      <Link href={`/workspace/notes/${note.id}`}
        className="note-card flex items-center gap-4 px-4 py-3 rounded-xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {note.title || "Untitled"}
            </span>
            {note.isPublic && <Globe size={11} style={{ color: "var(--text-muted)" }} />}
            {note.aiSummary && <Sparkles size={11} style={{ color: "var(--accent)" }} />}
          </div>
          {preview && (
            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{preview}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map(t => <TagBadge key={t.id} name={t.name} />)}
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/workspace/notes/${note.id}`}
      className="note-card flex flex-col rounded-xl border p-4 h-full"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1"
          style={{ color: "var(--text-primary)" }}>
          {note.title || "Untitled"}
        </h3>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {note.isPublic && <Globe size={12} style={{ color: "var(--text-muted)" }} />}
          {note.aiSummary && <Sparkles size={12} style={{ color: "var(--accent)" }} />}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <p className="text-xs leading-relaxed line-clamp-3 flex-1 mb-3"
          style={{ color: "var(--text-secondary)" }}>
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2"
        style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map(t => <TagBadge key={t.id} name={t.name} />)}
          {note.tags.length > 3 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>+{note.tags.length - 3}</span>
          )}
        </div>
        <span className="text-xs shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
