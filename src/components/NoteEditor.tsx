"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { api, Note, AIInsights } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Sparkles, Share2, Archive, ArchiveRestore, Tag, X,
  Check, Copy, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NoteEditorProps {
  note: Note;
  onUpdate: (note: Note) => void;
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState<string[]>(note.tags.map((t) => t.name));
  const [tagInput, setTagInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIInsights | null>(
    note.aiSummary ? {
      summary: note.aiSummary,
      action_items: note.aiActions ? JSON.parse(note.aiActions) : [],
      suggested_title: note.aiTitle || note.title,
    } : null
  );
  const [showAI, setShowAI] = useState(!!note.aiSummary);
  const [shareUrl, setShareUrl] = useState<string | null>(
    note.isPublic && note.shareId
      ? `${window.location.origin}/shared/${note.shareId}`
      : null
  );
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your note..." }),
    ],
    content: note.content,
    editorProps: { attributes: { class: "prose prose-invert max-w-none focus:outline-none" } },
    onUpdate: ({ editor }) => scheduleSave(title, editor.getHTML(), tags),
  });

  useEffect(() => {
    setTitle(note.title);
    setTags(note.tags.map((t) => t.name));
    setAiResult(note.aiSummary ? {
      summary: note.aiSummary,
      action_items: note.aiActions ? JSON.parse(note.aiActions) : [],
      suggested_title: note.aiTitle || note.title,
    } : null);
    setShowAI(!!note.aiSummary);
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || "");
    }
    setShareUrl(note.isPublic && note.shareId
      ? `${window.location.origin}/shared/${note.shareId}` : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  const scheduleSave = useCallback((t: string, c: string, tgs: string[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { note: updated } = await api.notes.update(note.id, { title: t, content: c, tags: tgs });
        onUpdate(updated);
      } catch {
        toast.error("Failed to save");
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [note.id, onUpdate]);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    scheduleSave(val, editor?.getHTML() || "", tags);
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        setTags(newTags);
        scheduleSave(title, editor?.getHTML() || "", newTags);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    scheduleSave(title, editor?.getHTML() || "", newTags);
  }

  async function handleGenerateAI() {
    setAiLoading(true);
    setShowAI(true);
    try {
      const { insights, note: updated } = await api.notes.generateSummary(note.id);
      setAiResult(insights);
      onUpdate(updated);
      toast.success("AI insights ready ✨");
    } catch {
      toast.error("AI generation failed — check your API key");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleShare() {
    try {
      const { note: updated } = await api.notes.update(note.id, { isPublic: !note.isPublic });
      onUpdate(updated);
      if (updated.isPublic && updated.shareId) {
        const url = `${window.location.origin}/shared/${updated.shareId}`;
        setShareUrl(url);
        toast.success("Note is now public 🔗");
      } else {
        setShareUrl(null);
        toast.success("Note is now private");
      }
    } catch {
      toast.error("Failed to update sharing");
    }
  }

  async function handleArchive() {
    try {
      const { note: updated } = await api.notes.update(note.id, { isArchived: !note.isArchived });
      onUpdate(updated);
      toast.success(updated.isArchived ? "Note archived" : "Note restored");
    } catch {
      toast.error("Failed to archive note");
    }
  }

  function copyShareUrl() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text3)" }}>
          {saving ? (
            <><Loader2 size={12} className="animate-spin" /> Saving...</>
          ) : (
            <><Check size={12} style={{ color: "#a78bfa" }} />
              Saved {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* AI button */}
          <button onClick={handleGenerateAI} disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: "var(--purple-glow)", color: "var(--purple3)", border: "1px solid rgba(139,92,246,0.25)" }}>
            {aiLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <Sparkles size={12} />}
            AI Insights
          </button>

          {/* Share */}
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={note.isPublic
              ? { background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }
              : { color: "var(--text2)", background: "var(--bg3)", border: "1px solid var(--border)" }
            }>
            <Share2 size={12} />
            {note.isPublic ? "Public" : "Share"}
          </button>

          {/* Archive */}
          <button onClick={handleArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ color: "var(--text2)", background: "var(--bg3)", border: "1px solid var(--border)" }}>
            {note.isArchived ? <ArchiveRestore size={12} /> : <Archive size={12} />}
            {note.isArchived ? "Restore" : "Archive"}
          </button>
        </div>
      </div>

      {/* Share URL bar */}
      {shareUrl && (
        <div className="mx-6 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <span className="flex-1 truncate" style={{ color: "#86efac" }}>{shareUrl}</span>
          <button onClick={copyShareUrl} style={{ color: "#86efac" }}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      )}

      {/* AI Panel */}
      {(aiResult || aiLoading) && (
        <div className="mx-6 mt-3 rounded-2xl overflow-hidden"
          style={{ background: "var(--bg3)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <button onClick={() => setShowAI(!showAI)}
            className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={13} style={{ color: "var(--purple3)" }} />
              <span className="text-sm font-semibold ai-shimmer">AI Insights</span>
            </div>
            {showAI
              ? <ChevronUp size={13} style={{ color: "var(--text3)" }} />
              : <ChevronDown size={13} style={{ color: "var(--text3)" }} />}
          </button>

          {showAI && (
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
              {aiLoading ? (
                <div className="flex items-center gap-2 py-3 text-sm" style={{ color: "var(--text2)" }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: "var(--purple3)" }} />
                  Generating insights...
                </div>
              ) : aiResult ? (
                <>
                  <div className="pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text3)" }}>Summary</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{aiResult.summary}</p>
                  </div>
                  {aiResult.action_items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text3)" }}>Action Items</p>
                      <ul className="space-y-1">
                        {aiResult.action_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text2)" }}>
                            <span style={{ color: "var(--purple3)" }} className="mt-0.5">◆</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiResult.suggested_title && aiResult.suggested_title !== title && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text3)" }}>Suggested Title</p>
                      <button
                        onClick={() => {
                          setTitle(aiResult.suggested_title);
                          scheduleSave(aiResult.suggested_title, editor?.getHTML() || "", tags);
                        }}
                        className="text-sm underline underline-offset-2 transition-colors"
                        style={{ color: "var(--purple3)" }}>
                        {aiResult.suggested_title}
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title"
          className="w-full text-2xl font-bold bg-transparent outline-none mb-4"
          style={{ color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif" }}
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {tags.map((tag) => (
            <span key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "var(--purple-glow)", color: "var(--purple3)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Tag size={10} />
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-400 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag..."
            className="text-xs bg-transparent outline-none w-20"
            style={{ color: "var(--text3)", fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        <EditorContent editor={editor} style={{ color: "var(--text)" }} />
      </div>
    </div>
  );
}
