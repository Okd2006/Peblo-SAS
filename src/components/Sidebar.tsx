"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { FileText, LayoutDashboard, Archive, LogOut, Plus, Tag, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

interface SidebarProps {
  onNewNote?: () => void;
  tags?: { name: string; count: number }[];
  activeTag?: string;
  onTagClick?: (tag: string) => void;
}

export default function Sidebar({ onNewNote, tags = [], activeTag, onTagClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleNewNote() {
    try {
      const { note } = await api.notes.create({ title: "Untitled", content: "" });
      router.push(`/workspace/notes/${note.id}`);
      onNewNote?.();
    } catch {
      toast.error("Failed to create note");
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
    toast.success("Signed out");
  }

  const navItems = [
    { href: "/workspace", label: "Notes", icon: FileText },
    { href: "/workspace/insights", label: "Insights", icon: LayoutDashboard },
    { href: "/workspace/archive", label: "Archive", icon: Archive },
  ];

  return (
    <aside className="flex flex-col h-full w-60 shrink-0"
      style={{ background: "var(--bg2)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center glow-purple"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
          <Sparkles size={14} className="text-white" />
        </div>
        <span className="font-bold text-sm gradient-text">Peblo Notes</span>
      </div>

      {/* New Note */}
      <div className="px-3 mb-4">
        <button onClick={handleNewNote}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all btn-primary">
          <Plus size={15} />
          New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              pathname === href
                ? "text-white"
                : "hover:bg-white/5"
            }`}
            style={pathname === href
              ? { background: "var(--purple-glow)", color: "var(--purple3)", border: "1px solid rgba(139,92,246,0.2)" }
              : { color: "var(--text2)" }
            }
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 mt-5">
          <div className="flex items-center gap-1.5 px-3 mb-2">
            <Tag size={11} style={{ color: "var(--text3)" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text3)" }}>Tags</span>
          </div>
          <div className="space-y-0.5 max-h-44 overflow-y-auto">
            {tags.map((tag) => (
              <button key={tag.name} onClick={() => onTagClick?.(tag.name)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all ${
                  activeTag === tag.name ? "" : "hover:bg-white/5"
                }`}
                style={activeTag === tag.name
                  ? { background: "var(--purple-glow)", color: "var(--purple3)" }
                  : { color: "var(--text2)" }
                }
              >
                <span className="truncate">#{tag.name}</span>
                <span className="text-xs ml-1" style={{ color: "var(--text3)" }}>{tag.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="mt-auto px-3 pb-4">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--text3)" }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="transition-colors hover:text-red-400"
            style={{ color: "var(--text3)" }} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
