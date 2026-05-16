"use client";
import { Sparkles, CheckSquare, Type, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AIOutputCardProps {
  summary?: string | null;
  actionItems?: string[];
  suggestedTitle?: string | null;
  loading?: boolean;
  onApplyTitle?: (title: string) => void;
  className?: string;
}

export function AIOutputCard({ summary, actionItems = [], suggestedTitle, loading, onApplyTitle, className }: AIOutputCardProps) {
  const [expanded, setExpanded] = useState(true);

  if (!loading && !summary && !suggestedTitle && actionItems.length === 0) return null;

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",
      className
    )}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--accent-light)" }}>
            <Sparkles size={12} style={{ color: "var(--accent)" }} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>AI Insights</span>
          {loading && <Loader2 size={12} className="animate-spin" style={{ color: "var(--accent)" }} />}
        </div>
        {expanded
          ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
          {loading ? (
            <div className="pt-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-3 rounded animate-pulse" style={{ background: "var(--surface-2)", width: `${70 + i * 10}%` }} />
              ))}
            </div>
          ) : (
            <>
              {summary && (
                <div className="pt-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={11} style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Summary</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{summary}</p>
                </div>
              )}

              {actionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckSquare size={11} style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Action Items</span>
                  </div>
                  <ul className="space-y-1.5">
                    {actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestedTitle && onApplyTitle && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Type size={11} style={{ color: "var(--accent)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Suggested Title</span>
                  </div>
                  <button
                    onClick={() => onApplyTitle(suggestedTitle)}
                    className="text-sm font-medium underline underline-offset-2 transition-colors hover:opacity-70"
                    style={{ color: "var(--accent)" }}
                  >
                    {suggestedTitle}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
