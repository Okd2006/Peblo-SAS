import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16 px-6", className)}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <Icon size={22} style={{ color: "var(--text-muted)" }} />
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{title}</h3>
      <p className="text-xs max-w-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
