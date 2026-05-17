"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, FileText, Share2, Archive, Tag,
  Settings, LogOut, Plus, ChevronLeft, ChevronRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PebloLogo } from "@/components/ui/PebloLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
  tags?: { name: string; count: number }[];
  activeTag?: string;
  onTagClick?: (tag: string) => void;
}

const NAV = [
  { href: "/workspace", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workspace/notes", label: "All Notes", icon: FileText },
  { href: "/workspace/shared", label: "Shared", icon: Share2 },
  { href: "/workspace/archive", label: "Archive", icon: Archive },
];

export default function AppSidebar({ tags = [], activeTag, onTagClick }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  async function handleNewNote() {
    try {
      const { note } = await api.notes.create({ title: "Untitled", content: "" });
      router.push(`/workspace/notes/${note.id}`);
    } catch {
      toast.error("Failed to create note");
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const isActive = (href: string) => {
    if (href === "/workspace") return pathname === "/workspace";
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
        "flex flex-col h-full shrink-0 transition-all duration-200 glass",
        collapsed ? "w-14" : "w-56"
      )}
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      {/* Logo + collapse */}
      <div className={cn("flex items-center h-14 px-3 shrink-0", collapsed ? "justify-center" : "justify-between")}
        style={{ borderBottom: "1px solid var(--border)" }}>
        {!collapsed && <PebloLogo size={28} />}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
            <Sparkles size={13} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-2)]"
          style={{ color: "var(--text-muted)" }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* New Note */}
      <div className={cn("px-2 py-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleNewNote}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-90"
                style={{ background: "var(--accent)", color: "white" }}>
                <Plus size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">New Note</TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={handleNewNote}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--accent)" }}>
            <Plus size={14} />
            New Note
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          collapsed ? (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link href={href}
                  className={cn("nav-item justify-center px-0 h-9 w-full", isActive(href) && "active")}>
                  <Icon size={16} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ) : (
            <Link key={href} href={href}
              className={cn("nav-item", isActive(href) && "active")}>
              <Icon size={15} />
              {label}
            </Link>
          )
        ))}

        {/* Tags section */}
        {!collapsed && tags.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center gap-1.5 px-2 mb-1.5">
              <Tag size={11} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Tags</span>
            </div>
            {tags.slice(0, 8).map((tag) => (
              <button key={tag.name} onClick={() => onTagClick?.(tag.name)}
                className={cn("nav-item w-full text-left", activeTag === tag.name && "active")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                <span className="flex-1 truncate">{tag.name}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{tag.count}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 space-y-0.5" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/workspace/settings" className="nav-item justify-center px-0 h-9 w-full">
                  <Settings size={15} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={handleLogout} className="nav-item justify-center px-0 h-9 w-full hover:text-red-500">
                  <LogOut size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Link href="/workspace/settings" className="nav-item">
              <Settings size={15} />
              Settings
            </Link>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mt-1"
              style={{ background: "var(--surface-2)" }}>
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-xs font-semibold"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
              </div>
              <button onClick={handleLogout}
                className="transition-colors hover:text-red-500 shrink-0"
                style={{ color: "var(--text-muted)" }}>
                <LogOut size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
