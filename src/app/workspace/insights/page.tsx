"use client";
import { useEffect, useState } from "react";
import { api, InsightsData } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { FileText, Archive, Sparkles, TrendingUp, Clock, Tag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.insights.get()
      .then(setData)
      .catch(() => toast.error("Failed to load insights"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: "var(--bg)" }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--purple)" }} />
        </div>
      </div>
    );
  }

  const maxActivity = data ? Math.max(...data.weeklyActivity.map((d) => d.count), 1) : 1;

  const statCards = [
    { label: "Total Notes", value: data?.totalNotes ?? 0, icon: FileText, color: "var(--purple3)" },
    { label: "Archived", value: data?.archivedNotes ?? 0, icon: Archive, color: "var(--text2)" },
    { label: "AI Summaries", value: data?.aiUsageCount ?? 0, icon: Sparkles, color: "#c4b5fd" },
    { label: "Tags Used", value: data?.topTags.length ?? 0, icon: Tag, color: "#a78bfa" },
  ];

  return (
    <div className="flex h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">Insights</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text2)" }}>Your notes productivity at a glance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "var(--purple-glow)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text3)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Weekly Activity */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={15} style={{ color: "var(--purple3)" }} />
                <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Weekly Activity</h2>
              </div>
              <div className="flex items-end gap-2 h-24">
                {data?.weeklyActivity.map(({ date, count }) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${(count / maxActivity) * 76}px`,
                        minHeight: count > 0 ? "6px" : "2px",
                        background: count > 0
                          ? "linear-gradient(180deg, #a78bfa, #7c3aed)"
                          : "var(--border)",
                        boxShadow: count > 0 ? "0 0 8px rgba(139,92,246,0.4)" : "none",
                      }}
                    />
                    <span className="text-xs" style={{ color: "var(--text3)" }}>
                      {format(new Date(date), "EEE")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Tags */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={15} style={{ color: "var(--purple3)" }} />
                <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Most Used Tags</h2>
              </div>
              {data?.topTags.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text3)" }}>No tags yet</p>
              ) : (
                <div className="space-y-3">
                  {data?.topTags.map(({ name, count }) => {
                    const maxCount = data.topTags[0]?.count || 1;
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-20 truncate" style={{ color: "var(--text2)" }}>#{name}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                              background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                            }}
                          />
                        </div>
                        <span className="text-xs w-4 text-right" style={{ color: "var(--text3)" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} style={{ color: "var(--purple3)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>Recently Edited</h2>
            </div>
            {data?.recentNotes.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text3)" }}>No notes yet</p>
            ) : (
              <div className="space-y-1">
                {data?.recentNotes.map((note) => (
                  <Link key={note.id} href={`/workspace/notes/${note.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-xl transition-all hover:bg-white/5">
                    <span className="text-sm truncate" style={{ color: "var(--text2)" }}>
                      {note.title || "Untitled"}
                    </span>
                    <span className="text-xs shrink-0 ml-3" style={{ color: "var(--text3)" }}>
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
