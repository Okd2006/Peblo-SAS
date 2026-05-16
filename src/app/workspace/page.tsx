"use client";
import { useEffect, useState } from "react";
import { api, InsightsData, Note } from "@/lib/api";
import TopNavbar from "@/components/TopNavbar";
import { StatCard } from "@/components/ui/StatCard";
import { NoteCard } from "@/components/NoteCard";
import { ActivityChart, TagDistributionChart } from "@/components/ActivityChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { FileText, Sparkles, TrendingUp, Tag, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.insights.get(),
      api.notes.list({ sort: "updatedAt" }),
    ])
      .then(([ins, { notes }]) => {
        setInsights(ins);
        setRecentNotes(notes.slice(0, 6));
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = insights?.weeklyActivity.map(({ date, count }) => ({
    day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
    notes: count,
  })) || [];

  const tagData = insights?.topTags.map(({ name, count }) => ({ name, value: count })) || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Dashboard" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6 fade-up">

          {/* Greeting */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Good morning ✨
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Here's what's happening with your notes today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Notes" value={insights?.totalNotes ?? "—"} icon={FileText} trend="12%" trendUp />
            <StatCard label="This Week" value={insights?.weeklyActivity.reduce((a, b) => a + b.count, 0) ?? "—"} icon={TrendingUp} trend="8%" trendUp />
            <StatCard label="AI Summaries" value={insights?.aiUsageCount ?? "—"} icon={Sparkles} accent />
            <StatCard label="Tags Used" value={insights?.topTags.length ?? "—"} icon={Tag} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Weekly Activity</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Notes created or edited</p>
                </div>
              </div>
              <ActivityChart data={weeklyData} />
            </div>

            <div className="rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Tag Distribution</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>Most used tags</p>
              {tagData.length > 0 ? (
                <>
                  <TagDistributionChart data={tagData} />
                  <div className="space-y-1.5 mt-2">
                    {tagData.slice(0, 4).map(({ name, value }, i) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: ["#7C3AED","#A78BFA","#C4B5FD","#DDD6FE"][i] }} />
                          <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                        </div>
                        <span style={{ color: "var(--text-muted)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-center py-8" style={{ color: "var(--text-muted)" }}>No tags yet</p>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: "var(--text-secondary)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Notes</h3>
              </div>
              <Link href="/workspace/notes" className="text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: "var(--accent)" }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <NoteCardSkeleton key={i} />)}
              </div>
            ) : recentNotes.length === 0 ? (
              <EmptyState icon={FileText} title="No notes yet"
                description="Create your first note to get started."
                action={
                  <Link href="/workspace/notes"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                    style={{ background: "var(--accent)" }}>
                    Create a note
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentNotes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
