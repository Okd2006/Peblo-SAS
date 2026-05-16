"use client";
import { Note } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Tag, Sparkles } from "lucide-react";
import Link from "next/link";

interface NoteListProps {
  notes: Note[];
  activeId?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").slice(0, 110);
}

export default function NoteList({ notes, activeId }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--purple-glow)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--text2)" }}>No notes yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {notes.map((note) => (
        <Link
          key={note.id}
          href={`/workspace/notes/${note.id}`}
          className="block px-4 py-3.5 transition-all"
          style={{
            borderBottom: "1px solid var(--border)",
            background: activeId === note.id ? "var(--purple-glow)" : "transparent",
            borderLeft: activeId === note.id ? "2px solid var(--purple)" : "2px solid transparent",
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate flex-1" style={{ color: "var(--text)" }}>
              {note.title || "Untitled"}
            </h3>
            {note.aiUsedAt && (
              <Sparkles size={11} style={{ color: "var(--purple3)" }} className="shrink-0 mt-0.5" />
            )}
          </div>

          {note.content && (
            <p className="text-xs line-clamp-2 mb-2 leading-relaxed" style={{ color: "var(--text3)" }}>
              {stripHtml(note.content)}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag) => (
                <span key={tag.id}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium"
                  style={{ background: "var(--purple-glow)", color: "var(--purple3)" }}>
                  <Tag size={9} />
                  {tag.name}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs" style={{ color: "var(--text3)" }}>+{note.tags.length - 3}</span>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: "var(--text3)" }}>
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
