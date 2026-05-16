import { cn } from "@/lib/utils";

const TAG_COLORS: Record<string, string> = {
  work:        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  design:      "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-900",
  dev:         "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  ideas:       "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  reading:     "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
  meeting:     "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900",
  planning:    "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  product:     "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900",
  productivity:"bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900",
};

const DEFAULT_COLOR = "bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-800";

interface TagBadgeProps {
  name: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function TagBadge({ name, className, onClick, active }: TagBadgeProps) {
  const colorClass = TAG_COLORS[name] || DEFAULT_COLOR;
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border transition-all",
        colorClass,
        onClick && "cursor-pointer hover:opacity-80",
        active && "ring-2 ring-offset-1 ring-current",
        className
      )}
    >
      {name}
    </span>
  );
}
