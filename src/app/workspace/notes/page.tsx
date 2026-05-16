"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, Note } from "@/lib/api";
import TopNavbar from "@/components/TopNavbar";
import { NoteCard } from "@/components/NoteCard";
import { TagBadge } from "@/components/ui/TagBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotesGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { Search, X, LayoutGrid, List, ChevronDown } from "lucide-react";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const { notes } = await api.notes.list({ search, tag: activeTag, sort });
      setNotes(notes);
    } catch { toast.error("Failed to load notes"); }
    finally { setLoading(false); }
  }, [search, activeTag, sort]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  useEffect(() => {
    api.tags.list().then(({ tags }) => setTags(tags)).catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      try {
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          // PDF — send to dedicated API route
          const token = (() => {
            try { return JSON.parse(localStorage.getItem("peblo-auth") || "{}").state?.token; } catch { return null; }
          })();
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/notes/import-pdf", {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (!res.ok) throw new Error("PDF parse failed");
          const { note } = await res.json();
          toast.success(`Imported "${note.title}"`);
          if (files.length === 1) { router.push(`/workspace/notes/${note.id}`); return; }
        } else {
          // Plain text / markdown
          const text = await file.text();
          const title = file.name.replace(/\.(txt|md|markdown)$/i, "");
          const content = text.split("\n\n").filter(Boolean)
            .map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
          const { note } = await api.notes.create({ title, content });
          toast.success(`Imported "${title}"`);
          if (files.length === 1) { router.push(`/workspace/notes/${note.id}`); return; }
        }
      } catch {
        toast.error(`Failed to import ${file.name}`);
      }
    }

    await fetchNotes();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="All Notes" showUpload onUpload={handleUpload} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-4 fade-up">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-9 pr-9 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "Inter, sans-serif",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm outline-none cursor-pointer"
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", fontFamily: "Inter, sans-serif",
                  }}>
                  <option value="updatedAt">Last edited</option>
                  <option value="createdAt">Created</option>
                  <option value="title">Title A–Z</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }} />
              </div>

              {/* View toggle */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {(["grid", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={cn("w-8 h-8 flex items-center justify-center transition-colors",
                      view === v ? "text-white" : "")}
                    style={view === v
                      ? { background: "var(--accent)", color: "white" }
                      : { background: "var(--surface)", color: "var(--text-muted)" }
                    }>
                    {v === "grid" ? <LayoutGrid size={13} /> : <List size={13} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tag filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <TagBadge key={tag.name} name={tag.name}
                  active={activeTag === tag.name}
                  onClick={() => setActiveTag(activeTag === tag.name ? "" : tag.name)}
                />
              ))}
              {activeTag && (
                <button onClick={() => setActiveTag("")}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors hover:opacity-70"
                  style={{ color: "var(--text-muted)" }}>
                  <X size={10} /> Clear
                </button>
              )}
            </div>
          )}

          {/* Count */}
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          </p>

          {/* Notes */}
          {loading ? (
            <NotesGridSkeleton />
          ) : notes.length === 0 ? (
            <EmptyState icon={FileText} title="No notes found"
              description={search || activeTag ? "Try adjusting your search or filters." : "Create your first note to get started."} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => <NoteCard key={note.id} note={note} view="grid" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map(note => <NoteCard key={note.id} note={note} view="list" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
