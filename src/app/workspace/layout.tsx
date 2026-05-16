"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AppSidebar from "@/components/AppSidebar";
import { GeminiSearch } from "@/components/GeminiSearch";
import { api } from "@/lib/api";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const fetchTags = useCallback(async () => {
    try {
      const { tags } = await api.tags.list();
      setTags(tags);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  if (!token) return null;

  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
          <AppSidebar
            tags={tags}
            activeTag={activeTag}
            onTagClick={(t) => setActiveTag(activeTag === t ? "" : t)}
          />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
        {/* Floating Gemini search — available everywhere in workspace */}
        <GeminiSearch />
      </TooltipProvider>
    </ThemeProvider>
  );
}
