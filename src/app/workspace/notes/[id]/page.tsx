"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { api, Note } from "@/lib/api";
import { TagBadge } from "@/components/ui/TagBadge";
import { AIOutputCard } from "@/components/ui/AIOutputCard";
import {
  Check, Loader2, Share2, Archive, ArchiveRestore,
  Trash2, Tag, X, Copy, Globe, Sparkles, ArrowLeft, PanelRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string; actionItems: string[]; suggestedTitle: string } | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: { attributes: { class: "ProseMirror" } },
    onUpdate: ({ editor }) => scheduleSave(title, editor.getHTML(), tags),
  });

  const fetchNote = useCallback(async () => {
    try {
      const { note } = await api.notes.get(id);
      setNote(note);
      setTitle(note.title);
      setTags(note.tags.map(t => t.name));
      editor?.commands.setContent(note.content || "");
      if (note.aiSummary) {
        setAiData({
          summary: note.aiSummary,
          actionItems: note.aiActions ? JSON.parse(note.aiActions) : [],
          suggestedTitle: note.aiTitle || "",
        });
        setShowAIPanel(true);
      }
      if (note.isPublic && note.shareId) {
        setShareUrl(`${window.location.origin}/shared/${note.shareId}`);
      }
    } catch {
      toast.error("Note not found");
      router.push("/workspace/notes");
    } finally {
      setLoading(false);
    }
  }, [id, editor, router]);

  useEffect(() => { if (editor) fetchNote(); }, [editor, fetchNote]);

  const scheduleSave = useCallback((t: string, c: string, tgs: string[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { note: updated } = await api.notes.update(id, { title: t, content: c, tags: tgs });
        setNote(updated);
      } catch { toast.error("Failed to save"); }
      finally { setSaving(false); }
    }, 800);
  }, [id]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    scheduleSave(e.target.value, editor?.getHTML() || "", tags);
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!tags.includes(t)) {
        const next = [...tags, t];
        setTags(next);
        scheduleSave(title, editor?.getHTML() || "", next);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    scheduleSave(title, editor?.getHTML() || "", next);
  }

  async function handleAI() {
    setShowAIPanel(true);
    setAiLoading(true);
    try {
      const { insights, note: updated } = await api.notes.generateSummary(id);
      setAiData({
        summary: insights.summary,
        actionItems: insights.action_items,
        suggestedTitle: insights.suggested_title,
      });
      setNote(updated);
      toast.success("AI insights ready ✨");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI generation failed";
      toast.error(msg, { duration: 5000 });
    } finally {
      setAiLoading(false);
    }
  }

  async function handleShare() {
    try {
      const { note: updated } = await api.notes.update(id, { isPublic: !note?.isPublic });
      setNote(updated);
      if (updated.isPublic && updated.shareId) {
        const url = `${window.location.origin}/shared/${updated.shareId}`;
        setShareUrl(url);
        toast.success("Note is now public");
      } else {
        setShareUrl(null);
        toast.success("Note is now private");
      }
    } catch { toast.error("Failed to update sharing"); }
  }

  async function handleArchive() {
    try {
      const { note: updated } = await api.notes.update(id, { isArchived: !note?.isArchived });
      setNote(updated);
      toast.success(updated.isArchived ? "Archived" : "Restored");
    } catch { toast.error("Failed"); }
  }

  async function handleDelete() {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await api.notes.delete(id);
      toast.success("Note deleted");
      router.push("/workspace/notes");
    } catch { toast.error("Failed to delete"); }
  }

  function copyUrl() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Editor column ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between h-12 px-5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>

          {/* Left */}
          <div className="flex items-center gap-3">
            <Link href="/workspace/notes"
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-60"
              style={{ color: "var(--text-secondary)" }}>
              <ArrowLeft size={13} />
              Notes
            </Link>
            <span style={{ color: "var(--border-2)" }}>·</span>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {saving
                ? <><Loader2 size={11} className="animate-spin" /> Saving…</>
                : <><Check size={11} style={{ color: "#10B981" }} />
                    Saved {note && formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</>
              }
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {/* AI Insights — primary CTA */}
            <button
              onClick={handleAI}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: "var(--accent)", color: "white" }}
            >
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              {aiLoading ? "Generating…" : "AI Insights"}
            </button>

            {/* Share */}
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={note?.isPublic
                ? { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }
                : { background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }>
              {note?.isPublic ? <Globe size={11} /> : <Share2 size={11} />}
              {note?.isPublic ? "Public" : "Share"}
            </button>

            {/* Archive */}
            <button onClick={handleArchive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {note?.isArchived ? <ArchiveRestore size={11} /> : <Archive size={11} />}
              {note?.isArchived ? "Restore" : "Archive"}
            </button>

            {/* Toggle AI panel */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                showAIPanel ? "text-white" : "hover:bg-[var(--surface-2)]"
              )}
              style={showAIPanel
                ? { background: "var(--accent-light)", color: "var(--accent)" }
                : { color: "var(--text-muted)" }
              }
              title="Toggle AI panel"
            >
              <PanelRight size={13} />
            </button>

            {/* Delete */}
            <button onClick={handleDelete}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500"
              style={{ color: "var(--text-muted)" }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Share URL banner */}
        {shareUrl && (
          <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
            <Globe size={12} className="text-emerald-600 shrink-0" />
            <span className="flex-1 truncate text-emerald-700">{shareUrl}</span>
            <button onClick={copyUrl} className="text-emerald-600 hover:text-emerald-800 shrink-0">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}

        {/* Editor body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled"
              className="w-full text-3xl font-semibold tracking-tight bg-transparent outline-none mb-4"
              style={{ color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}
            />

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1">
                  <TagBadge name={tag} />
                  <button onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                    style={{ color: "var(--text-muted)" }}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Tag size={11} style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add tag…"
                  className="text-xs bg-transparent outline-none w-20"
                  style={{ color: "var(--text-secondary)", fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>

            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* ── AI Panel ── */}
      {showAIPanel && (
        <div className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderLeft: "1px solid var(--border)", background: "var(--surface)" }}>

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "var(--accent-light)" }}>
                <Sparkles size={11} style={{ color: "var(--accent)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</span>
            </div>
            <button onClick={() => setShowAIPanel(false)}
              className="w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-[var(--surface-2)]"
              style={{ color: "var(--text-muted)" }}>
              <X size={12} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!aiData && !aiLoading ? (
              /* Empty state — prompt user to generate */
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <Sparkles size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    No insights yet
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Click "AI Insights" to generate a summary, action items, and title suggestion.
                  </p>
                </div>
                <button
                  onClick={handleAI}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 mt-1"
                  style={{ background: "var(--accent)" }}
                >
                  <Sparkles size={12} />
                  Generate now
                </button>
              </div>
            ) : (
              <AIOutputCard
                summary={aiData?.summary}
                actionItems={aiData?.actionItems}
                suggestedTitle={aiData?.suggestedTitle}
                loading={aiLoading}
                onApplyTitle={(t) => {
                  setTitle(t);
                  scheduleSave(t, editor?.getHTML() || "", tags);
                  toast.success("Title applied");
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
