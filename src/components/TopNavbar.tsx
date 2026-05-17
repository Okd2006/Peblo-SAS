"use client";
import { Moon, Sun, Plus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface TopNavbarProps {
  title?: string;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showUpload?: boolean;
  rightSlot?: React.ReactNode;
}

export default function TopNavbar({ title, onUpload, showUpload, rightSlot }: TopNavbarProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { theme, toggle } = useTheme();

  async function handleNewNote() {
    try {
      const { note } = await api.notes.create({ title: "Untitled", content: "" });
      router.push(`/workspace/notes/${note.id}`);
    } catch {
      toast.error("Failed to create note");
    }
  }

  return (
    <header className="flex items-center justify-between h-14 px-5 shrink-0 glass"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3">
        {title && (
          <h1 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {showUpload && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[var(--surface-2)]")}
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              <Upload size={13} />
              Import
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.pdf" multiple className="hidden" onChange={onUpload} />
          </>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button
          onClick={handleNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Plus size={13} />
          New Note
        </button>

        {rightSlot}
      </div>
    </header>
  );
}
