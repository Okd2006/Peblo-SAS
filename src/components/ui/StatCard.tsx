import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, className, accent }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all hover:shadow-sm",
      accent
        ? "border-violet-200 dark:border-violet-900"
        : "border-[var(--border)] bg-[var(--surface)]",
      className
    )}
      style={accent ? { background: "var(--accent-light)" } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          accent ? "bg-violet-100 dark:bg-violet-900" : "bg-[var(--surface-2)]"
        )}>
          <Icon size={16} className={accent ? "text-violet-600 dark:text-violet-400" : "text-[var(--text-secondary)]"} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-md",
            trendUp
              ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
              : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
          )}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  );
}
